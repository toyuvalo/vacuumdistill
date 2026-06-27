/* ── Config ─────────────────────────────────────────────────── */
const REPO_OWNER = 'toyuvalo';
const REPO_NAME  = 'vacuumdistill';

// poll.json is fetched from the repo each load — no build step needed
const POLL_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/docs/poll.json`;

// GitHub REST API — unauthenticated reads for public repos work fine
const GH_API  = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`;
const GH_DISCUSSION_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}/issues`;

/* ── Stream status detection ─────────────────────────────────── */
// YouTube channel ID — fill this in once the channel exists
const YT_CHANNEL_ID = '';   // e.g. 'UCxxxxxxxxxxxxxxxxxxxxxx'

function renderStream() {
  const wrap = document.getElementById('stream-wrap');
  if (!YT_CHANNEL_ID) {
    wrap.innerHTML = `
      <div class="stream-placeholder">
        <div class="icon">🧪</div>
        <p>Stream coming soon — YouTube channel not yet linked</p>
        <p style="font-size:12px;font-family:monospace;opacity:.5;">Set YT_CHANNEL_ID in docs/app.js</p>
      </div>`;
    document.getElementById('live-badge').innerHTML = `
      <span class="offline-badge">OFFLINE</span>`;
    return;
  }

  wrap.innerHTML = `
    <iframe
      src="https://www.youtube.com/embed/live_stream?channel=${YT_CHANNEL_ID}&autoplay=1&mute=1"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen>
    </iframe>`;
}

/* ── Poll ────────────────────────────────────────────────────── */
async function fetchVotes(issueNumber) {
  try {
    const r = await fetch(`${GH_API}/${issueNumber}/reactions?content=%2B1`, {
      headers: { Accept: 'application/vnd.github.squirrel-girl-preview+json' }
    });
    if (!r.ok) return 0;
    const data = await r.json();
    return Array.isArray(data) ? data.length : 0;
  } catch {
    return 0;
  }
}

async function renderPoll() {
  const container = document.getElementById('poll-container');

  let pollData;
  try {
    const r = await fetch(POLL_URL + '?t=' + Date.now()); // bust cache
    pollData = await r.json();
  } catch {
    container.innerHTML = '<p class="poll-loading">Could not load poll data.</p>';
    return;
  }

  const { poll, now_distilling, past } = pollData;

  // Update "Now Distilling"
  if (now_distilling) {
    document.getElementById('now-name').textContent = now_distilling.name;
    if (now_distilling.notes) {
      document.getElementById('now-meta').textContent = now_distilling.notes;
    }
  }

  // Render past distillations
  const pastEl = document.getElementById('past-list');
  if (past && pastEl) {
    pastEl.innerHTML = past.map(p => `
      <div class="past-item">
        <span class="past-item-name">${p.name}</span>
        <span class="past-item-date">${p.date}</span>
      </div>`).join('');
  }

  // Poll
  document.getElementById('poll-question').textContent = poll.question;
  document.getElementById('poll-loading').remove();

  // Fetch all vote counts in parallel
  const counts = await Promise.all(poll.options.map(o => fetchVotes(o.issue)));
  const total  = counts.reduce((a, b) => a + b, 0) || 1;

  const optionsEl = document.getElementById('poll-options');
  optionsEl.innerHTML = poll.options.map((opt, i) => {
    const pct = Math.round((counts[i] / total) * 100);
    return `
      <div class="poll-option">
        <span class="poll-emoji">${opt.emoji}</span>
        <div class="poll-bar-wrap">
          <span class="poll-label">${opt.label}</span>
          <div class="poll-bar-bg">
            <div class="poll-bar-fill" style="width:${pct}%"></div>
          </div>
        </div>
        <span class="poll-count">${counts[i]} 👍</span>
      </div>`;
  }).join('');

  // Vote button opens the first issue (viewers can browse from there)
  document.getElementById('vote-btn').href = GH_DISCUSSION_URL;
  document.getElementById('poll-closes').textContent = `Poll closes ${poll.closes}`;
}

/* ── Init ────────────────────────────────────────────────────── */
renderStream();
renderPoll();
