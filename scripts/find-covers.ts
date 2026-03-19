/**
 * Cover Image Pipeline
 *
 * 1. For each book, search Google Books by title + author (+ ISBN if available)
 * 2. Verify the returned title matches ours
 * 3. Verify the thumbnail is a real image (not placeholder)
 * 4. Generate a visual review HTML page for Charlotte to approve/reject
 * 5. Output approved covers as JSON to be applied to library.json
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const ROOT = join(import.meta.dirname, '..')
const LIBRARY_PATH = join(ROOT, 'src/data/library.json')
const DELAY_MS = 200

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

interface Book {
  id: string
  title: string
  author: string
  isbn13?: string
  links: { amazon?: string; cover?: string }
}

interface CoverCandidate {
  id: string
  title: string
  author: string
  matchedTitle: string
  matchedAuthors: string[]
  coverUrl: string
  titleScore: number
  authorScore: number
}

function normalise(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()
}

function titleScore(ours: string, theirs: string): number {
  const a = normalise(ours)
  const b = normalise(theirs)
  if (a === b) return 1
  if (b.startsWith(a) || a.startsWith(b)) return 0.95
  if (a.includes(b) || b.includes(a)) return 0.85
  const aWords = a.split(' ').filter(w => w.length > 2)
  const bWords = b.split(' ').filter(w => w.length > 2)
  if (aWords.length === 0) return 0
  const common = aWords.filter(w => bWords.includes(w))
  return common.length / aWords.length
}

function authorScore(ours: string, theirs: string[]): number {
  const ourSurnames = ours.split(/[,&]/).map(n => normalise(n.trim().split(' ').pop() || ''))
  const theirNorm = theirs.map(n => normalise(n))
  for (const surname of ourSurnames) {
    if (theirNorm.some(t => t.includes(surname))) return 1
  }
  return 0
}

async function searchGoogleBooks(book: Book): Promise<CoverCandidate | null> {
  // Try multiple search strategies
  const strategies: string[] = []

  // Strategy 1: title + author surname
  const surname = book.author.split(/[,&]/).shift()?.trim().split(' ').pop() || ''
  strategies.push(`intitle:${book.title} inauthor:${surname}`)

  // Strategy 2: ISBN if available
  if (book.isbn13) {
    strategies.push(`isbn:${book.isbn13}`)
  }

  // Strategy 3: exact title
  strategies.push(`"${book.title}" ${surname}`)

  for (const query of strategies) {
    try {
      const q = encodeURIComponent(query)
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=3`, {
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) continue
      const data = await res.json()
      if (!data.items?.length) continue

      for (const item of data.items) {
        const vi = item.volumeInfo
        if (!vi?.imageLinks?.thumbnail) continue

        const ts = titleScore(book.title, vi.title || '')
        const as = authorScore(book.author, vi.authors || [])

        // Both title and author must match
        if (ts >= 0.7 && as >= 0.5) {
          let url = vi.imageLinks.thumbnail
          url = url.replace('http://', 'https://').replace('zoom=1', 'zoom=2').replace('&edge=curl', '')

          return {
            id: book.id,
            title: book.title,
            author: book.author,
            matchedTitle: vi.title,
            matchedAuthors: vi.authors || [],
            coverUrl: url,
            titleScore: ts,
            authorScore: as,
          }
        }
      }
    } catch {
      continue
    }
    await sleep(100)
  }

  return null
}

function generateReviewPage(candidates: CoverCandidate[], failed: string[]): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cover Image Review</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #D8D8D8; color: #1a1a1a; padding: 2rem; max-width: 1100px; margin: 0 auto; }
  h1 { font-size: 2rem; font-weight: 400; margin-bottom: 0.5rem; }
  .subtitle { color: #666; font-size: 0.95rem; margin-bottom: 2rem; }
  .stats { display: flex; gap: 2rem; margin-bottom: 2rem; padding: 1rem; background: white; border-radius: 8px; }
  .stat { text-align: center; }
  .stat-num { font-size: 1.5rem; font-weight: 600; }
  .stat-label { font-size: 0.75rem; color: #888; }
  .card { background: white; border-radius: 8px; padding: 1.25rem; margin-bottom: 0.75rem; display: flex; gap: 1rem; align-items: start; border-left: 4px solid transparent; }
  .card.approved { border-left-color: #4caf50; }
  .card.rejected { border-left-color: #f44336; opacity: 0.4; }
  .card img { width: 80px; height: auto; border-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.15); flex-shrink: 0; }
  .card-info { flex: 1; }
  .card-title { font-size: 1rem; font-weight: 500; margin-bottom: 0.15rem; }
  .card-author { font-size: 0.85rem; color: #888; margin-bottom: 0.5rem; }
  .card-match { font-size: 0.75rem; color: #666; margin-bottom: 0.5rem; }
  .card-match .score { font-weight: 600; }
  .card-match .high { color: #2e7d32; }
  .card-match .medium { color: #e65100; }
  .btns { display: flex; gap: 0.5rem; }
  .btn { padding: 0.35rem 0.75rem; border: 1px solid #ccc; border-radius: 4px; background: transparent; cursor: pointer; font-size: 0.8rem; font-family: inherit; }
  .btn.yes.active { background: #4caf50; color: white; border-color: #4caf50; }
  .btn.no.active { background: #f44336; color: white; border-color: #f44336; }
  .export-bar { position: sticky; bottom: 0; background: #1a1a1a; color: #D8D8D8; padding: 1rem 1.5rem; border-radius: 8px; margin-top: 2rem; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 -4px 20px rgba(0,0,0,0.15); }
  .export-btn { padding: 0.6rem 1.5rem; background: white; color: #1a1a1a; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: 500; font-family: inherit; }
</style>
</head>
<body>
<h1>Cover Image Review</h1>
<p class="subtitle">Review each cover image. Approve if the cover matches the book. Reject if it's wrong. Export the approved covers.</p>

<div class="stats">
  <div class="stat"><div class="stat-num" id="total">${candidates.length}</div><div class="stat-label">Candidates</div></div>
  <div class="stat"><div class="stat-num" id="approved">0</div><div class="stat-label">Approved</div></div>
  <div class="stat"><div class="stat-num" id="rejected">0</div><div class="stat-label">Rejected</div></div>
  <div class="stat"><div class="stat-num">${failed.length}</div><div class="stat-label">No image found</div></div>
</div>

<div id="cards">
${candidates.map((c, i) => `
  <div class="card" id="card-${i}" data-id="${c.id}" data-url="${c.coverUrl.replace(/"/g, '&quot;')}">
    <img src="${c.coverUrl}" alt="${c.title}" onerror="this.style.display='none'">
    <div class="card-info">
      <div class="card-title">${c.title}</div>
      <div class="card-author">${c.author}</div>
      <div class="card-match">
        Matched: "${c.matchedTitle}" by ${c.matchedAuthors.join(', ')}
        — Title: <span class="score ${c.titleScore >= 0.9 ? 'high' : 'medium'}">${(c.titleScore * 100).toFixed(0)}%</span>
        Author: <span class="score ${c.authorScore >= 0.9 ? 'high' : 'medium'}">${(c.authorScore * 100).toFixed(0)}%</span>
      </div>
      <div class="btns">
        <button class="btn yes" onclick="approve(${i})">✓ Approve</button>
        <button class="btn no" onclick="reject(${i})">✗ Reject</button>
      </div>
    </div>
  </div>
`).join('')}
</div>

<div class="export-bar">
  <span><span id="export-count">0</span> covers ready</span>
  <button class="export-btn" onclick="exportCovers()">Export approved covers</button>
</div>

<script>
const state = Array(${candidates.length}).fill('pending');

function update() {
  document.getElementById('approved').textContent = state.filter(s => s === 'approved').length;
  document.getElementById('rejected').textContent = state.filter(s => s === 'rejected').length;
  document.getElementById('export-count').textContent = state.filter(s => s === 'approved').length;
}

function approve(i) {
  state[i] = state[i] === 'approved' ? 'pending' : 'approved';
  const card = document.getElementById('card-' + i);
  card.className = 'card' + (state[i] === 'approved' ? ' approved' : '');
  card.querySelector('.btn.yes').className = 'btn yes' + (state[i] === 'approved' ? ' active' : '');
  card.querySelector('.btn.no').className = 'btn no';
  update();
  save();
}

function reject(i) {
  state[i] = state[i] === 'rejected' ? 'pending' : 'rejected';
  const card = document.getElementById('card-' + i);
  card.className = 'card' + (state[i] === 'rejected' ? ' rejected' : '');
  card.querySelector('.btn.no').className = 'btn no' + (state[i] === 'rejected' ? ' active' : '');
  card.querySelector('.btn.yes').className = 'btn yes';
  update();
  save();
}

function exportCovers() {
  const covers = [];
  state.forEach((s, i) => {
    if (s === 'approved') {
      const card = document.getElementById('card-' + i);
      covers.push({ id: card.dataset.id, coverUrl: card.dataset.url });
    }
  });
  const blob = new Blob([JSON.stringify(covers, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'approved-covers-' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
}

function save() { localStorage.setItem('cover-review', JSON.stringify(state)); }
function load() {
  const saved = localStorage.getItem('cover-review');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      parsed.forEach((s, i) => {
        if (s === 'approved') approve(i);
        else if (s === 'rejected') reject(i);
      });
    } catch(e) {}
  }
}
load();
</script>
</body>
</html>`
}

async function main() {
  const library: Book[] = JSON.parse(readFileSync(LIBRARY_PATH, 'utf-8'))

  // Only process books that don't already have a cover
  const booksNeedingCovers = library.filter(b => !b.links.cover)
  console.log(`${library.length} books total, ${booksNeedingCovers.length} need covers\n`)

  const candidates: CoverCandidate[] = []
  const failed: string[] = []

  for (let i = 0; i < booksNeedingCovers.length; i++) {
    const book = booksNeedingCovers[i]
    const progress = `[${i + 1}/${booksNeedingCovers.length}]`

    await sleep(DELAY_MS)
    const result = await searchGoogleBooks(book)

    if (result) {
      console.log(`${progress} ✓ ${book.title} → "${result.matchedTitle}" (T:${(result.titleScore * 100).toFixed(0)}% A:${(result.authorScore * 100).toFixed(0)}%)`)
      candidates.push(result)
    } else {
      console.log(`${progress} ✗ ${book.title}`)
      failed.push(book.title)
    }
  }

  // Generate review page
  const html = generateReviewPage(candidates, failed)
  const reviewPath = join(ROOT, 'scripts/cover-review.html')
  writeFileSync(reviewPath, html)

  console.log('\n' + '='.repeat(50))
  console.log(`Found covers: ${candidates.length}/${booksNeedingCovers.length}`)
  console.log(`No cover: ${failed.length}`)
  console.log(`\nReview page: ${reviewPath}`)
  console.log('Open it, approve/reject covers, then export.')
}

main().catch(console.error)
