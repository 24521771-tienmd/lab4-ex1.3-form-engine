import { Fragment, useId } from 'react'

/**
 * Semantic key–value inspector (docs/contracts/ex1.3-form-engine.md §5.3).
 * Values are rendered as JSX text, so untrusted strings are auto-escaped.
 *
 * @param {Object} props
 * @param {Record<string, unknown>} props.data
 * @param {string} [props.title]
 */
export default function ShowData({ data, title = 'Submitted data' }) {
  const headingId = useId()

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId}>{title}</h2>
      <dl className="json-inspector">
        {Object.entries(data).map(([key, value]) => (
          <Fragment key={key}>
            <dt>{key}</dt>
            <dd>{String(value)}</dd>
          </Fragment>
        ))}
      </dl>
    </section>
  )
}
