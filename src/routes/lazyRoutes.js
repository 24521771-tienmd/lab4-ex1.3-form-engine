/**
 * Route chunk loaders (contract: docs/contracts/ex1.1-lazy-loading.md §2).
 * Kept separate from the lazy() declarations in App.jsx so the same import()
 * can be reused for preloading and replaced by deferred mocks in tests (D3).
 * Each loader resolves to a module whose `default` export is the page component.
 */

export const loadArenaPage = () => import('../pages/ArenaPage.jsx')
export const loadPeopleLayout = () => import('../pages/people/PeopleLayout.jsx')
export const loadNotFoundPage = () => import('../pages/NotFoundPage.jsx')
export const loadPersonDetail = () => import('../pages/people/PersonDetail.jsx')
export const loadRegisterPage = () => import('../pages/register/RegisterPage.jsx')
