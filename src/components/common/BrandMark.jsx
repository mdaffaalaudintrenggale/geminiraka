import { initials } from '../../lib/utils';

export default function BrandMark({ logo, name, className = '', size = 'md' }) {
  return (
    <span className={`brand-mark brand-mark--${size} ${className}`} aria-hidden="true">
      {logo ? (
        <img src={logo} alt="" className="brand-mark__image" />
      ) : (
        <span className="brand-mark__monogram">{initials(name)}</span>
      )}
      <span className="brand-mark__corner" />
    </span>
  );
}
