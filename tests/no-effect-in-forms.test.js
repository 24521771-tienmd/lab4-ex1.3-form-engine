import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import test from 'node:test'

// Static architecture guards for Ex1.3 (project-rules.md §7.2, TASK_DECOMPOSITION.md T19).
const SRC_DIR = fileURLToPath(new URL('../src/', import.meta.url))
const FORMS_DIR = path.join(SRC_DIR, 'forms')
const LEGACY_DIR = path.join(SRC_DIR, 'legacy')

const SOURCE_EXTENSIONS = new Set(['.js', '.jsx'])
const isTestFile = (file) => /\.test\.jsx?$/.test(file)
const toPosix = (file) => path.relative(SRC_DIR, file).split(path.sep).join('/')

async function listSourceFiles(dir) {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true })
  return entries
    .filter((entry) => entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name)))
    .map((entry) => path.join(entry.parentPath, entry.name))
}

test('src/forms contains engine source files to guard', async () => {
  const files = (await listSourceFiles(FORMS_DIR)).filter((file) => !isTestFile(file)).map(toPosix)
  for (const expected of ['forms/FormContext.js', 'forms/InputField.jsx', 'forms/SimpleForm.jsx', 'forms/validateRegistration.js']) {
    assert.ok(files.includes(expected), `${expected} should exist`)
  }
})

test('no file in src/forms (excluding tests) uses useEffect or useLayoutEffect', async () => {
  const files = (await listSourceFiles(FORMS_DIR)).filter((file) => !isTestFile(file))
  const offenders = []
  for (const file of files) {
    const source = await readFile(file, 'utf8')
    if (/\buse(Layout)?Effect\b/.test(source)) offenders.push(toPosix(file))
  }
  assert.deepEqual(offenders, [], `effects found in the form engine: ${offenders.join(', ')}`)
})

test('no app file outside src/legacy imports from legacy/ (tests excepted)', async () => {
  const files = (await listSourceFiles(SRC_DIR)).filter(
    (file) => !isTestFile(file) && !file.startsWith(LEGACY_DIR + path.sep),
  )
  const importsLegacy = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)['"][^'"]*\blegacy\//
  const offenders = []
  for (const file of files) {
    const source = await readFile(file, 'utf8')
    if (importsLegacy.test(source)) offenders.push(toPosix(file))
  }
  assert.deepEqual(offenders, [], `app code imports the legacy reproduction: ${offenders.join(', ')}`)
})
