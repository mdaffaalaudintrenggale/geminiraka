export default function SectionHeader({ index, label, title, description, aside }) {
  return (
    <div className="section-header" data-reveal>
      <div className="section-index">
        <span className="section-index__number">{index}</span>
        <span className="section-index__label">{label}</span>
        <span className="section-index__line" />
      </div>
      <div className="section-heading-main">
        <h2 className="section-title">{title}</h2>
        {description ? <p className="section-description">{description}</p> : null}
      </div>
      {aside ? <div className="section-aside">{aside}</div> : null}
    </div>
  );
}
