const DEFAULT_ITEMS = [
  'INFORMATION SYSTEMS',
  'WEB DEVELOPMENT',
  'UI ENGINEERING',
  'RESEARCH & WRITING',
  'DATA VISUALIZATION',
];

export default function Ticker({ settings }) {
  const items = [...(settings.focus?.length ? settings.focus : DEFAULT_ITEMS), settings.role].filter(Boolean);
  const track = [...items, ...items, ...items];

  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">
        {track.map((item, index) => (
          <span key={`${item}-${index}`}>
            {item}
            <i>✦</i>
          </span>
        ))}
      </div>
    </div>
  );
}
