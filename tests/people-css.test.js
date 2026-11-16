import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const peopleCssSource = new URL('../src/pages/people/people.css', import.meta.url)
const indexCssSource = new URL('../src/index.css', import.meta.url)

/** Body of the first top-level `:root { … }` block (no nested braces inside). */
function rootBlock(css) {
  const match = css.match(/:root\s*\{([^}]*)\}/)
  assert.ok(match, 'expected a :root block')
  return match[1]
}

test('people-frame declares the minmax(280px, 1fr) 2fr master-detail grid', async () => {
  const css = await readFile(peopleCssSource, 'utf8')

  assert.match(
    css,
    /\.people-frame\s*\{[^}]*grid-template-columns:\s*minmax\(280px,\s*1fr\)\s+2fr\s*;/,
  )
})

test('people-frame collapses to one column at the 640px breakpoint', async () => {
  const css = await readFile(peopleCssSource, 'utf8')

  assert.match(
    css,
    /@media\s*\(max-width:\s*640px\)\s*\{\s*\.people-frame\s*\{[^}]*grid-template-columns:\s*1fr\s*;/,
  )
})

test('people.css declares the dossier dimension custom properties on :root', async () => {
  const root = rootBlock(await readFile(peopleCssSource, 'utf8'))

  for (const property of [
    '--dossier-heading-height',
    '--dossier-row-height',
    '--dossier-row-gap',
    '--dossier-panel-padding',
  ]) {
    assert.match(root, new RegExp(`${property}\\s*:`), `${property} is missing`)
  }
})

test('index.css declares --page-skeleton-min-height globally on :root (Decision D5)', async () => {
  const root = rootBlock(await readFile(indexCssSource, 'utf8'))

  assert.match(root, /--page-skeleton-min-height\s*:/)
})

test('dossier content uses the shared custom properties instead of hard-coded sizes', async () => {
  const css = await readFile(peopleCssSource, 'utf8')

  assert.match(
    css,
    /\.content-area\s*\{[^}]*padding:\s*var\(--dossier-panel-padding\)\s*;/,
  )
  assert.match(
    css,
    /\.content-area h2\s*\{[^}]*min-height:\s*var\(--dossier-heading-height\)\s*;/,
  )
  assert.match(
    css,
    /\.person-details\s*\{[^}]*gap:\s*var\(--dossier-row-gap\)\s+1\.25rem\s*;/,
  )
  assert.match(
    css,
    /\.person-details dt,\s*\.person-details dd\s*\{[^}]*min-height:\s*var\(--dossier-row-height\)\s*;/,
  )
})
