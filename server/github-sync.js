import 'dotenv/config';

const API = 'https://api.github.com';
const DEFAULT_DELAY = 1200;

const state = {
  lastSync: null,
  lastSha: '',
  lastError: '',
  lastMessage: '',
  lastCommitUrl: '',
};

let timer = null;
let running = false;
let dirty = false;
let warned = false;

function config() {
  return {
    token: process.env.GITHUB_SYNC_TOKEN || '',
    repo: process.env.GITHUB_REPO || '',
    branch: process.env.GITHUB_BRANCH || 'main',
    path: process.env.GITHUB_CONTENT_PATH || 'content/site-snapshot.json',
    delay: Number(process.env.GITHUB_SYNC_DELAY) || DEFAULT_DELAY,
  };
}

export function githubSyncStatus() {
  const { token, repo, branch, path } = config();
  return {
    enabled: Boolean(token && repo),
    repo,
    branch,
    path,
    ...state,
  };
}

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'daffa-profile-system',
    'Content-Type': 'application/json',
  };
}

function contentsUrl(repo, filePath) {
  const encoded = filePath.split('/').map(encodeURIComponent).join('/');
  return `${API}/repos/${repo}/contents/${encoded}`;
}

function buildSnapshot(db) {
  return {
    generatedAt: db.meta?.updatedAt || new Date().toISOString(),
    version: 1,
    settings: db.settings,
    works: db.works.filter((item) => item.published),
    apps: db.apps.filter((item) => item.published),
    certificates: db.certificates.filter((item) => item.published),
  };
}

function withoutTimestamp(value = {}) {
  const { generatedAt, ...rest } = value;
  return rest;
}

function sameContent(existingText, snapshot) {
  try {
    const existing = JSON.parse(existingText);
    return JSON.stringify(withoutTimestamp(existing)) === JSON.stringify(withoutTimestamp(snapshot));
  } catch {
    return false;
  }
}

async function uploadOnce(snapshot) {
  const { token, repo, branch, path } = config();
  const url = contentsUrl(repo, path);
  const requestHeaders = headers(token);

  let sha = '';
  const existingResponse = await fetch(`${url}?ref=${encodeURIComponent(branch)}`, {
    headers: requestHeaders,
    signal: AbortSignal.timeout(15000),
  });

  if (existingResponse.status === 404) {
    sha = '';
  } else if (!existingResponse.ok) {
    throw new Error(`GitHub gagal membaca ${path} (${existingResponse.status}).`);
  } else {
    const existing = await existingResponse.json();
    sha = existing.sha || '';
    if (existing.content) {
      const text = Buffer.from(existing.content, existing.encoding === 'base64' ? 'base64' : 'utf8').toString('utf8');
      if (sameContent(text, snapshot)) {
        state.lastSync = state.lastSync || new Date().toISOString();
        state.lastError = '';
        return;
      }
    }
  }

  const counts = `${snapshot.works.length} karya, ${snapshot.apps.length} aplikasi, ${snapshot.certificates.length} sertifikat`;
  const body = {
    message: `chore: sinkron konten CMS (${counts})`,
    content: Buffer.from(`${JSON.stringify(snapshot, null, 2)}\n`, 'utf8').toString('base64'),
    branch,
    ...(sha ? { sha } : {}),
  };

  const response = await fetch(url, {
    method: 'PUT',
    headers: requestHeaders,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    const error = new Error(`GitHub gagal menulis ${path} (${response.status}).`);
    error.retry = response.status === 409 || response.status === 422;
    error.detail = detail.slice(0, 200);
    throw error;
  }

  const result = await response.json();
  state.lastSync = new Date().toISOString();
  state.lastSha = result.content?.sha || '';
  state.lastCommitUrl = result.commit?.html_url || '';
  state.lastMessage = `Sinkron: ${counts}`;
  state.lastError = '';
  console.log(`[github-sync] ${state.lastMessage} → ${repo}/${path}@${branch}`);
}

async function upload(snapshot) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await uploadOnce(snapshot);
      return;
    } catch (error) {
      if (!error.retry || attempt === 2) throw error;
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
}

async function flush(db) {
  if (running) return;
  running = true;
  try {
    while (dirty) {
      dirty = false;
      await upload(buildSnapshot(db));
    }
  } catch (error) {
    state.lastError = error.detail ? `${error.message} ${error.detail}` : error.message;
    console.error(`[github-sync] ${state.lastError}`);
  } finally {
    running = false;
    if (dirty && !timer) scheduleGithubSync(db);
  }
}

export function scheduleGithubSync(db) {
  const { token, repo, delay } = config();
  if (!token || !repo) {
    if (!warned) {
      warned = true;
      console.log('[github-sync] Nonaktif: isi GITHUB_SYNC_TOKEN dan GITHUB_REPO di .env untuk mengaktifkan.');
    }
    return;
  }

  dirty = true;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    void flush(db);
  }, delay);
  if (typeof timer.unref === 'function') timer.unref();
}
