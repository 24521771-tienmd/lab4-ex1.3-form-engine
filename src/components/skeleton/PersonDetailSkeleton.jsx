import Skeleton from './Skeleton.jsx'

/**
 * Suspense fallback for the lazy PersonDetail route (contract §4).
 * Mirrors PersonDetail's box model: one heading bar (the single line) plus a
 * `.person-details` grid with the same 2 rows (Name, Role). The <dl> keeps the
 * real class so it inherits the shared T07 dimensions; it is decorative only.
 */
export default function PersonDetailSkeleton() {
  return (
    <Skeleton
      label="Loading player dossier"
      lines={1}
      className="person-detail-skeleton"
    >
      <dl className="person-details" aria-hidden="true">
        <dt />
        <dd />
        <dt />
        <dd />
      </dl>
    </Skeleton>
  )
}
