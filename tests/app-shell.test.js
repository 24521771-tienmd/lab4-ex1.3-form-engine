import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const appSource = new URL('../src/layouts/AppLayout.jsx', import.meta.url)
const arenaPageSource = new URL('../src/pages/ArenaPage.jsx', import.meta.url)
const documentSource = new URL('../index.html', import.meta.url)

test('HTML entry loads the semantic arena shell', async () => {
  const [app, arenaPage, document] = await Promise.all([
    readFile(appSource, 'utf8'),
    readFile(arenaPageSource, 'utf8'),
    readFile(documentSource, 'utf8'),
  ])

  assert.match(document, /<title>KRAFTON x PUBG Vietnam/)
  assert.match(document, /src="\/src\/main\.jsx"/)
  assert.match(app, /<main\b/)
  assert.match(arenaPage, /<h1\b[^>]*>KRAFTON x PUBG Vietnam<\/h1>/)
})
