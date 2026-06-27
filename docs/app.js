/* ── Config ─────────────────────────────────────────────────── */
const REPO_OWNER = 'toyuvalo';
const REPO_NAME  = 'vacuumdistill';

const POLL_URL   = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/docs/poll.json`;
const GH_API     = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`;
const ISSUES_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}/issues`;

/* ── Load poll.json ─────────────────────────────────────────── */
async function loadPollData() {
  const r = await fetch(POLL_URL + '?t=' + Date.now());
  if (!r.ok) throw new Error('Failed to load poll.json');
  return r.json();
}

/* ── Stream embed ────────────────────────────────────────────── */
function renderStream(channelId) {
  const wrap = document.getElementById('stream-wrap');
  if (!channelId) {
    wrap.innerHTML = `
      <div class="stream-placeholder">
        <div class="icon">⚗️</div>
        <p>Stream coming soon</p>
        <p style="font-size:12px;font-family:monospace;opacity:.5">Set platforms.youtube channel URL in docs/poll.json</p>
      </div>`;
    document.getElementById('live-badge').innerHTML =
      `<span class="offline-badge">OFFLINE</span>`;
    return;
  }
  // Extract channel ID from URL if full URL was given
  const id = channelId.replace(/.*youtube\.com\/@?/, '').replace(/.*channel\//, '');
  wrap.innerHTML = `
    <iframe
      src="https://www.youtube.com/embed/live_stream?channel=${id}&autoplay=1&mute=1"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen>
    </iframe>`;
}

/* ── Platform buttons ────────────────────────────────────────── */
function wirePlatformLinks(platforms) {
  const btns = {
    'yt-link':     platforms?.youtube,
    'twitch-link': platforms?.twitch,
    'kick-link':   platforms?.kick,
  };
  for (const [id, url] of Object.entries(btns)) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (url) {
      el.href = url;
      el.style.opacity = '1';
    } else {
      el.href = '#';
      el.style.opacity = '0.4';
      el.title = 'Channel not yet configured — check back soon';
    }
  }
}

/* ── Vote counts ─────────────────────────────────────────────── */
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

/* ── Poll ────────────────────────────────────────────────────── */
async function renderPoll(pollData) {
  const { poll, now_distilling, past } = pollData;

  if (now_distilling) {
    document.getElementById('now-name').textContent = now_distilling.name;
    if (now_distilling.notes)
      document.getElementById('now-meta').textContent = now_distilling.notes;
  }

  // Past distillations
  const pastEl = document.getElementById('past-list');
  if (past && pastEl) {
    pastEl.innerHTML = past.map(p => `
      <div class="past-item">
        <span class="past-item-name">${p.name}</span>
        <span class="past-item-date">${p.date}</span>
      </div>`).join('');
  }

  document.getElementById('poll-question').textContent = poll.question;
  const loadingEl = document.getElementById('poll-loading');
  if (loadingEl) loadingEl.remove();

  // Fetch all vote counts in parallel
  const counts = await Promise.all(poll.options.map(o => fetchVotes(o.issue)));
  const total  = counts.reduce((a, b) => a + b, 0) || 1;

  document.getElementById('poll-options').innerHTML = poll.options.map((opt, i) => {
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
        <a class="poll-count" href="${ISSUES_URL}/${opt.issue}" target="_blank" rel="noopener"
           title="Vote on GitHub">${counts[i]} 👍</a>
      </div>`;
  }).join('');

  document.getElementById('vote-btn').href = ISSUES_URL;
  document.getElementById('poll-closes').textContent = `Poll closes ${poll.closes}`;
}

/* ── Init ────────────────────────────────────────────────────── */
(async () => {
  try {
    const data = await loadPollData();
    renderStream(data.platforms?.youtube);
    wirePlatformLinks(data.platforms);
    await renderPoll(data);
  } catch (e) {
    console.error('Failed to load stream data:', e);
    document.getElementById('stream-wrap').innerHTML = `
      <div class="stream-placeholder">
        <div class="icon">⚗️</div>
        <p>Failed to load — refresh to retry</p>
      </div>`;
  }
})();
