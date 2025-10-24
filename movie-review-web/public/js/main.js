document.addEventListener('DOMContentLoaded', () => {
  const apiBase = '/api/movies';
  const fallbackData = '/server/data/movies.json';
  const movieGrid = document.getElementById('movieGrid');
  const movieSelect = document.getElementById('movieSelect');
  const posterChoices = document.getElementById('posterChoices');
  const reviewText = document.getElementById('reviewText');
  const submitReview = document.getElementById('submitReview');
  const clearForm = document.getElementById('clearForm');
  const searchInput = document.getElementById('searchInput');
  const refreshBtn = document.getElementById('refreshBtn');

  let movies = [];
  let selectedPoster = null;

  const posterPresets = {
    "Interstellar": [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRqNHPAJkSvjPN5vBrNnWmqUKgXC3lRQJvMQ&s",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRqNHPAJkSvjPN5vBrNnWmqUKgXC3lRQJvMQ&s",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRqNHPAJkSvjPN5vBrNnWmqUKgXC3lRQJvMQ&s"
    ],
    "Inception": [
      "https://images.unsplash.com/photo-1499084732479-de2c02d45fc4?w=800&q=60&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=60&auto=format&fit=crop"
    ],
    "Tenet": [
      "https://images.unsplash.com/photo-1502209524168-acea9368a8a1?w=800&q=60&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=800&q=60&auto=format&fit=crop"
    ]
  };

  function avg(ratings) {
    if (!ratings || ratings.length === 0) return '0.0';
    return (ratings.reduce((a,b)=>a+b,0) / ratings.length).toFixed(1);
  }

  async function fetchMovies() {
    try {
      const res = await fetch(apiBase);
      if (!res.ok) throw new Error('API not available');
      const data = await res.json();
      return Array.isArray(data) ? data : (data.movies || []);
    } catch (e) {
      // fallback to local json
      try {
        const r2 = await fetch(fallbackData);
        if (r2.ok) {
          const d2 = await r2.json();
          return d2.movies || d2;
        }
      } catch (e2) { /* ignore */ }
      console.warn('Could not fetch movies from API or fallback:', e);
      return [];
    }
  }

  async function loadMovies() {
    movies = await fetchMovies();
    if (!movies || movies.length === 0) {
      movieGrid.innerHTML = '<div class="note">No movies found. Start the server or place movies.json in server/data/</div>';
      movieSelect.innerHTML = '<option value="">-- no movies --</option>';
      return;
    }
    renderMovieGrid(movies);
    populateSelect(movies);
  }

  function renderMovieGrid(list) {
    movieGrid.innerHTML = '';
    list.forEach(m => {
      const posterUrl = (posterPresets[m.title] && posterPresets[m.title][0]) || '/images/placeholder.png';
      const card = document.createElement('article');
      card.className = 'movie-card';
      card.innerHTML = `
        <div class="poster" tabindex="0">
          <img src="${posterUrl}" alt="${escapeHtml(m.title)} poster" loading="lazy">
        </div>
        <div class="card-body">
          <div class="card-head">
            <div>
              <div class="movie-title">${escapeHtml(m.title)}</div>
              <div class="meta"><div class="badge">${(m.reviews||[]).length} reviews</div></div>
            </div>
            <div style="text-align:right">
              <div class="stars">⭐ <span class="avg">${avg(m.ratings)}</span></div>
              <div style="color:var(--muted); font-size:12px">avg</div>
            </div>
          </div>
          <div class="reviews">
            ${(m.reviews||[]).slice(0,3).map((r,i)=>`<div class="review"><div class="text">${escapeHtml(r)}</div><div class="rate">${(m.ratings||[])[i]||'-'}★</div></div>`).join('')}
          </div>
          <div style="display:flex; gap:8px; margin-top:8px;">
            <button data-title="${escapeHtml(m.title)}" class="btn add-review">Add Review</button>
            <button data-title="${escapeHtml(m.title)}" class="btn ghost view-more">View all</button>
          </div>
        </div>
      `;
      movieGrid.appendChild(card);
    });

    // attach handlers
    movieGrid.querySelectorAll('.add-review').forEach(b => b.addEventListener('click', e => {
      const title = e.currentTarget.dataset.title;
      selectMovie(title);
      scrollToReviewPanel();
    }));

    movieGrid.querySelectorAll('.view-more').forEach(b => b.addEventListener('click', e => {
      const title = e.currentTarget.dataset.title;
      const mv = movies.find(x => x.title === title);
      alert(`${title}\n\n${(mv.reviews||[]).map((r,i)=>`- ${r} (${(mv.ratings||[])[i]||'-'}★)`).join('\n\n') || 'No reviews yet.'}`);
    }));

    movieGrid.querySelectorAll('.poster img').forEach(img => {
      img.addEventListener('click', e => {
        const card = e.currentTarget.closest('.movie-card');
        const titleEl = card.querySelector('.movie-title');
        if (!titleEl) return;
        const title = titleEl.textContent.trim();
        selectMovie(title);
        renderPosterChoices(title, e.currentTarget.src);
        scrollToReviewPanel();
      });
    });
  }

  function populateSelect(list) {
    movieSelect.innerHTML = '<option value="">-- select movie --</option>';
    list.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.title;
      opt.textContent = m.title;
      movieSelect.appendChild(opt);
    });
  }

  function renderPosterChoices(title, preselect) {
    posterChoices.innerHTML = '';
    selectedPoster = null;
    const opts = posterPresets[title] || ['/images/placeholder.png'];
    opts.forEach(url => {
      const img = document.createElement('img');
      img.src = url;
      img.alt = title;
      img.tabIndex = 0;
      img.addEventListener('click', () => {
        Array.from(posterChoices.children).forEach(c => c.classList.remove('selected'));
        img.classList.add('selected');
        selectedPoster = url;
      });
      img.addEventListener('keydown', ev => {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); img.click(); }
      });
      posterChoices.appendChild(img);
      if (preselect && preselect === url) { img.classList.add('selected'); selectedPoster = url; }
    });
  }

  function selectMovie(title) {
    movieSelect.value = title;
    renderPosterChoices(title);
  }

  function scrollToReviewPanel() {
    document.getElementById('reviewPanel').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function clearForm() {
    movieSelect.value = '';
    posterChoices.innerHTML = '';
    reviewText.value = '';
    selectedPoster = null;
    document.querySelectorAll('input[name="rating"]').forEach(i => i.checked = false);
  }

  submitReview.addEventListener('click', async () => {
    const title = movieSelect.value;
    const text = (reviewText.value || '').trim();
    const ratingInput = document.querySelector('input[name="rating"]:checked');
    const rating = ratingInput ? parseInt(ratingInput.value, 10) : 0;

    if (!title) return alert('Please select a movie.');
    if (!text) return alert('Please enter a review.');
    if (!rating) return alert('Please choose a rating.');

    const mv = movies.find(m => m.title === title);
    if (mv) {
      mv.reviews = mv.reviews || [];
      mv.ratings = mv.ratings || [];
      mv.reviews.unshift(text);
      mv.ratings.unshift(rating);
      renderMovieGrid(movies);
      clearForm();
    }

    // optional: try to POST to server
    try {
      await fetch(`${apiBase}/${encodeURIComponent(title)}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review: text, rating, image: selectedPoster })
      });
    } catch (err) {
      // ignore - UI updated locally
      console.warn('Server POST failed (optional)', err);
    }
  });

  clearForm.addEventListener('click', () => clearForm());
  movieSelect.addEventListener('change', e => {
    const t = e.target.value;
    if (!t) { posterChoices.innerHTML = ''; return; }
    renderPosterChoices(t);
  });

  searchInput.addEventListener('input', e => {
    const q = (e.target.value || '').trim().toLowerCase();
    if (!q) return renderMovieGrid(movies);
    renderMovieGrid(movies.filter(m => (m.title||'').toLowerCase().includes(q) || ((m.reviews||[]).join(' ')||'').toLowerCase().includes(q)));
  });

  refreshBtn.addEventListener('click', () => loadMovies());

  function escapeHtml(s) {
    return (s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // initial
  loadMovies();

  // after you set selectedPoster or posterPresets, sync hero image
  const heroPosterImg = document.getElementById('heroPosterImg');
  if (heroPosterImg) {
    // prefer selectedPoster if already set, else use the static mrfox image
    heroPosterImg.src = selectedPoster || '/images/mrfox.jpg';
    heroPosterImg.addEventListener('click', () => {
      // scroll to review panel when clicking the big poster
      const panel = document.getElementById('reviewPanel');
      if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
});