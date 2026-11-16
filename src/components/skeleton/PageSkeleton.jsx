import Skeleton from './Skeleton.jsx'

/**
 * Route-level Suspense fallback rendered inside AppLayout's <main> (contract §3a).
 * Height comes from the global --page-skeleton-min-height (Decision D5).
 */
export default function PageSkeleton() {
  return <Skeleton label="Loading page" className="page-skeleton" />
}
