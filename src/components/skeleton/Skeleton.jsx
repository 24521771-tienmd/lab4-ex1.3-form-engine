import './skeleton.css'

/**
 * Accessible loading placeholder (contract: docs/contracts/ex1.1-lazy-loading.md §4).
 * The region announces `label` politely; every decorative shape is hidden
 * from assistive technology.
 *
 * @param {{
 *   label?: string,
 *   lines?: number,
 *   className?: string,
 *   children?: import('react').ReactNode,
 * }} props `children` is optional decorative markup (Decision D4); callers
 *   must mark it `aria-hidden="true"`.
 */
export default function Skeleton({
  label = 'Loading content',
  lines = 3,
  className = '',
  children,
}) {
  // Placeholder bars have no data identity; each gets a fixed positional id.
  const lineIds = Array.from(
    { length: lines },
    (_, position) => `skeleton-line-${position + 1}`,
  )

  return (
    <section
      className={['skeleton', className].filter(Boolean).join(' ')}
      aria-busy="true"
      aria-live="polite"
    >
      <span className="visually-hidden">{label}</span>
      {lineIds.map((lineId) => (
        <span key={lineId} className="skeleton-line" aria-hidden="true" />
      ))}
      {children}
    </section>
  )
}
