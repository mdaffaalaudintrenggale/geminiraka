import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, BookOpen, Sparkles } from 'lucide-react';
import SectionHeader from './SectionHeader';
import WorkModal from './WorkModal';

const FILTERS = ['Semua', 'Artikel', 'Jurnal', 'Karya Tulis'];

function WorkCard({ work, index, onOpen }) {
  return (
    <motion.article
      layout
      className={`work-card ${work.featured ? 'is-featured' : ''}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.045, 0.22), ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -5 }}
      onClick={() => onOpen(work)}
    >
      <span className="work-card__watermark">{String(index + 1).padStart(2, '0')}</span>
      <div className="work-card__top">
        <span className="work-type">{work.type}</span>
        {work.featured ? (
          <span className="work-featured">
            <Sparkles size={12} /> Pilihan
          </span>
        ) : null}
        <span className="work-year">{work.year || '—'}</span>
      </div>

      <div className="work-card__body">
        <span className="work-category">{work.category || 'Umum'}</span>
        <h3>{work.title}</h3>
        <p>{work.excerpt}</p>
      </div>

      <div className="work-card__tags">
        {(work.tags || []).slice(0, 4).map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>

      <div className="work-card__foot">
        <span>
          <BookOpen size={15} />
          Baca karya
        </span>
        <span className="work-card__arrow">
          <ArrowUpRight size={17} />
        </span>
      </div>
    </motion.article>
  );
}

export default function WorksSection({ works = [] }) {
  const [filter, setFilter] = useState('Semua');
  const [selected, setSelected] = useState(null);

  const counts = useMemo(() => {
    return FILTERS.reduce((acc, item) => {
      acc[item] = item === 'Semua' ? works.length : works.filter((work) => work.type === item).length;
      return acc;
    }, {});
  }, [works]);

  const filtered = filter === 'Semua' ? works : works.filter((work) => work.type === filter);

  return (
    <section className="section works" id="karya">
      <div className="container">
        <SectionHeader
          index="02"
          label="PUSTAKA / KARYA"
          title={<>Rekam gagasan & <em>riset.</em></>}
          description="Kumpulan artikel, jurnal, dan karya tulis yang saya susun dari proses belajar, observasi, dan eksperimen."
          aside={
            <span className="section-count">
              <strong>{String(works.length).padStart(2, '0')}</strong>
              <span>DOKUMEN<br />TERARSIP</span>
            </span>
          }
        />

        <div className="work-toolbar" data-reveal>
          <div className="filter-tabs" role="tablist" aria-label="Filter karya">
            {FILTERS.map((item) => (
              <button
                type="button"
                key={item}
                role="tab"
                aria-selected={filter === item}
                className={filter === item ? 'is-active' : ''}
                onClick={() => setFilter(item)}
              >
                {filter === item ? (
                  <motion.span className="filter-tabs__bg" layoutId="work-filter" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                ) : null}
                <span>{item}</span>
                <em>{String(counts[item] || 0).padStart(2, '0')}</em>
              </button>
            ))}
          </div>
          <span className="work-toolbar__hint">KLIK KARTU UNTUK MEMBACA</span>
        </div>

        {filtered.length ? (
          <motion.div layout className="work-grid">
            <AnimatePresence mode="popLayout">
              {filtered.map((work, index) => (
                <WorkCard key={work.id} work={work} index={index} onOpen={setSelected} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="empty-state">
            <BookOpen size={24} />
            <strong>Belum ada karya pada kategori ini.</strong>
            <span>Silakan tambahkan melalui panel superadmin.</span>
          </div>
        )}
      </div>

      <WorkModal work={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
