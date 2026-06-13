// Main application - config loading, rendering, and interactive features

const MOBILE_BREAKPOINT = 768;
const SWIPE_THRESHOLD = 15;
const SCROLL_THRESHOLD = 50;
const TIMELINE_GAP = 48;
// Vertical space (px) reserved around timeline photos so a card fits one viewport.
// Larger on desktop (card must fit the screen); smaller on mobile where the card scrolls.
const PHOTO_HEIGHT_OFFSET_DESKTOP = 470;
const PHOTO_HEIGHT_OFFSET_MOBILE = 180;
const PHOTO_WIDTH_OFFSET = 48;
const PHOTO_GAP = 12;
const LOADER_FADE_MS = 300;

function isMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
}

// --- HTML helpers ---

function mapsButton(url, text, compact = false) {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="maps-button${compact ? ' compact' : ''}">
        <span class="maps-icon">\uD83D\uDCCD</span>
        <span class="maps-text">${text}</span>
        <span class="maps-arrow">\u2197</span>
    </a>`;
}

function pinterestButton(p) {
    if (!p) return '';
    return `<a href="${p.url}" target="_blank" rel="noopener" class="pinterest-button">
        <span class="pinterest-icon">📌</span>
        <span class="pinterest-text">${p.text}</span>
        <span class="pinterest-arrow">↗</span>
    </a>`;
}

function dressCodeBlock(dc) {
    if (!dc) return '';
    return `<div class="dress-code">
        <div class="dress-code-title">${dc.title}</div>
        ${dc.description ? `<div class="dress-code-description">${dc.description}</div>` : ''}
        ${pinterestButton(dc.pinterest)}
    </div>`;
}

function radioGroup(name, label, options) {
    return `<div class="form-group">
        <label>${label} *</label>
        <div class="radio-group">
            <label class="radio-label">
                <input type="radio" name="${name}" value="yes" required>
                <span>${options.yes}</span>
            </label>
            <label class="radio-label">
                <input type="radio" name="${name}" value="no" required>
                <span>${options.no}</span>
            </label>
        </div>
    </div>`;
}

function formInput(id, name, label, opts = {}) {
    const type = opts.type || 'text';
    const required = opts.required !== false;
    const placeholder = opts.placeholder ? ` placeholder="${opts.placeholder}"` : '';
    return `<div class="form-group">
        <label for="${id}">${label}${required ? ' *' : ''}</label>
        <input type="${type}" id="${id}" name="${name}"${placeholder}${required ? ' required' : ''}>
    </div>`;
}

function showFormMessage(el, message, type) {
    el.textContent = message;
    el.className = `form-message ${type}`;
}

// --- Section renderers ---

function renderItinerary(itinerary) {
    if (!itinerary || itinerary.length === 0) return '';
    return `<ul class="itinerary-list">
        ${itinerary.map(item => `
            <li class="itinerary-item">
                <span class="itinerary-time">${item.time}</span>
                <span class="itinerary-event">${item.event}${item.optional ? ' <span class="event-optional">Optional</span>' : ''}</span>
            </li>
        `).join('')}
    </ul>`;
}

function renderEventCard(ev) {
    if (!ev) return '';
    return `
        <article class="card animate${ev.optional ? ' card-optional' : ''}">
            ${ev.optional || ev.date ? `<div class="card-header">
                ${ev.date ? `<span class="event-date-chip">${ev.date}</span>` : ''}
                ${ev.optional ? '<span class="event-optional">Optional</span>' : ''}
            </div>` : ''}
            <h3>${ev.label}</h3>
            ${ev.maps_url ? mapsButton(ev.maps_url, ev.venue) : (ev.venue ? `<p class="event-venue">${ev.venue}</p>` : '')}
            ${ev.description ? `<p class="event-description">${ev.description}</p>` : ''}
            ${renderItinerary(ev.itinerary)}
            ${dressCodeBlock(ev.dress_code)}
        </article>
    `;
}

function renderDetails(config) {
    const events = [
        config.welcome_dinner,
        config.ceremony,
        config.reception,
        config.goodbye_brunch,
    ];
    return `
        <div class="content-grid">
            ${events.map(renderEventCard).join('')}
        </div>
    `;
}

function renderTravel(config) {
    return `
        <div class="horizontal-cards">
            ${config.travel.airports.map(airport => `
                <article class="card animate horizontal-card">
                    <div class="card-content">
                        <div class="card-header">
                            <h3>${airport.name}</h3>
                            <span class="airport-code">${airport.code}</span>
                        </div>
                        <div class="travel-metrics">
                            <div class="metric">
                                <span class="metric-label">Distance:</span>
                                <span class="metric-value">${airport.distance_miles} miles</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Drive Time:</span>
                                <span class="metric-value">${airport.drive_time}</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Cost Range:</span>
                                <span class="metric-value cost-${airport.cost_range.length}">${airport.cost_range}</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Flight Availability:</span>
                                <span class="metric-value availability-${airport.flight_availability.toLowerCase()}">${airport.flight_availability}</span>
                            </div>
                        </div>
                        <p class="airport-description">${airport.description}</p>
                        ${airport.airlines ? `<p class="airlines"><strong>Airlines:</strong> ${airport.airlines.join(', ')}</p>` : ''}
                    </div>
                </article>
            `).join('')}
        </div>
        ${config.travel.driving_tips ? `
            <div class="travel-tips">
                <h3>${config.travel.tips_label}</h3>
                <ul>
                    ${config.travel.driving_tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
        ` : ''}
    `;
}

function renderAccommodations(config) {
    return `
        <div class="content-grid">
            ${config.hotels.map(hotel => `
                <article class="card animate hotel-card">
                    <h3 title="${hotel.name}">${hotel.name}</h3>
                    ${hotel.description ? `<p class="hotel-description">${hotel.description}</p>` : ''}
                    <div class="hotel-info">
                        ${hotel.rate ? `<div class="hotel-rate">${hotel.rate}</div>` : ''}
                        ${hotel.code ? `<div class="hotel-code">Booking Code: <strong>${hotel.code}</strong></div>` : ''}
                    </div>
                    <div class="hotel-actions">
                        ${hotel.link ? `<a href="${hotel.link}" target="_blank" rel="noopener" class="book-button">Book Now</a>` : ''}
                        ${hotel.maps_url ? mapsButton(hotel.maps_url, 'Get Directions', true) : ''}
                    </div>
                </article>
            `).join('')}
        </div>
    `;
}

function renderRegistry(config) {
    return `
        <div class="registry-wrapper">
            <p class="registry-message">${config.registry.message}</p>
            <div class="registry-grid">
                ${config.registry.stores.map(store => `
                    <article class="card animate registry-card">
                        <div class="registry-icon">${store.icon}</div>
                        <h3>${store.name}</h3>
                        ${store.description ? `<p class="registry-description">${store.description}</p>` : ''}
                        <a href="${store.url}" target="_blank" rel="noopener" class="registry-button">
                            ${store.button_text}
                        </a>
                    </article>
                `).join('')}
            </div>
        </div>
    `;
}

function renderRecommendations(config) {
    const r = config.recommendations;
    return `
        <div class="recommendations-wrapper">
            ${r.intro ? `<p class="recommendations-intro">${r.intro}</p>` : ''}
            <div class="content-grid">
                ${r.cards.map(card => `
                    <article class="card animate">
                        <h3>${card.icon ? `${card.icon} ` : ''}${card.title}</h3>
                        <ul class="rec-tips">
                            ${card.tips.map(tip => `
                                <li>
                                    <span class="rec-tip-name">${tip.name}</span>
                                    ${tip.description ? `<span class="rec-tip-desc">${tip.description}</span>` : ''}
                                </li>
                            `).join('')}
                        </ul>
                        ${r.doc_url ? `<a href="${r.doc_url}" target="_blank" rel="noopener" class="rec-card-link">${card.link_text || `More ${card.title.toLowerCase()} ideas`} <span class="rec-card-arrow">↗</span></a>` : ''}
                    </article>
                `).join('')}
            </div>
            ${r.doc_url ? `
                <a href="${r.doc_url}" target="_blank" rel="noopener" class="registry-button rec-doc-button">
                    <span>${r.doc_button_text || 'See our full guide'}</span>
                    <span class="pinterest-arrow">↗</span>
                </a>
            ` : ''}
        </div>
    `;
}

function renderRSVP(config) {
    const deadline = new Date(config.rsvp.deadline).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    const f = config.rsvp.form_fields;
    const opts = config.rsvp.radio_options;
    const p = config.rsvp.placeholders;

    return `
        <div class="rsvp-wrapper">
            <p>${config.rsvp.labels.deadline_text} ${deadline}</p>
            <div class="form-container">
                <form id="rsvp-form" class="rsvp-form no-print">
                    <div class="form-grid">
                        ${formInput('firstName', 'firstName', f.first_name)}
                        ${formInput('lastName', 'lastName', f.last_name)}
                        <div class="form-group span-2">
                            <label for="email">${f.email} *</label>
                            <input type="email" id="email" name="email" required>
                        </div>
                        ${radioGroup('attendingCeremony', f.attending_ceremony, opts)}
                        ${radioGroup('attendingReception', f.attending_reception, opts)}
                        <div class="form-group">
                            <label for="dietaryRestrictions">${f.dietary_restrictions}</label>
                            <textarea id="dietaryRestrictions" name="dietaryRestrictions" rows="2" placeholder="${p.dietary_restrictions}"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="anythingElse">${f.anything_else}</label>
                            <textarea id="anythingElse" name="anythingElse" rows="2" placeholder="${p.anything_else}"></textarea>
                        </div>
                    </div>

                    <div id="plus-one-section" class="plus-one-section hidden">
                        <hr class="form-divider">
                        ${radioGroup('hasPlusOne', f.plus_one_question, opts)}
                        <div id="plus-one-name-group" class="form-group hidden">
                            <label for="plusOneName">${f.plus_one_name} *</label>
                            <input type="text" id="plusOneName" name="plusOneName" placeholder="${p.plus_one_name}" required>
                        </div>
                    </div>

                    <div id="form-message" class="form-message"></div>

                    <button type="submit" class="submit-button" id="submit-button">
                        ${config.rsvp.labels.submit_button}
                    </button>
                </form>
            </div>
        </div>
    `;
}

function renderTimeline(config) {
    return `
        <div class="timeline-container">
            <button class="timeline-nav timeline-prev" aria-label="Previous timeline item">
                <span>\u2039</span>
            </button>
            <div class="timeline-horizontal">
                ${config.timeline.events.map((event, index) => {
                    const images = event.images || (event.image ? [event.image] : []);
                    return `
                        <article class="timeline-item-horizontal animate" data-index="${index}">
                            <div class="timeline-card">
                                <div class="timeline-text">
                                    <h3 class="timeline-date">${event.date}</h3>
                                    <h4 class="timeline-title">${event.title}</h4>
                                    ${event.description ? `<p class="timeline-description">${event.description}</p>` : ''}
                                </div>
                                ${images.length > 0 ? `
                                    <div class="timeline-images-horizontal">
                                        ${images.map(img => `
                                            <div class="timeline-image-wrapper">
                                                <img src="${img}" alt="${event.title}" loading="lazy" decoding="async" class="timeline-photo">
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        </article>
                    `;
                }).join('')}
            </div>
            <button class="timeline-nav timeline-next" aria-label="Next timeline item">
                <span>\u203A</span>
            </button>
            <div class="timeline-swipe-hint" aria-hidden="true">
                <span class="timeline-swipe-text">Swipe for more</span>
                <span class="timeline-swipe-arrow">\u2192</span>
            </div>
        </div>
    `;
}

const renderers = {
    details: renderDetails,
    travel: renderTravel,
    accommodations: renderAccommodations,
    recommendations: renderRecommendations,
    registry: renderRegistry,
    rsvp: renderRSVP,
    timeline: renderTimeline,
};

// --- Core rendering ---

function renderSection(section, config) {
    const sectionConfig = config[section.id] || {};

    if (section.id === 'home') {
        return `
            <header class="hero" id="home">
                <div>
                    <h1>${config.couple.names.replace('&', '<span class="hero-accent">&</span>')}</h1>
                    <p class="hero-date">${config.date.display}</p>
                    <div id="countdown" class="countdown"></div>
                </div>
            </header>
        `;
    }

    let html = `<section id="${section.id}" class="animate">`;
    html += `<h2 class="section-title">${section.title || section.name}</h2>`;

    if (section.content) {
        html += `<div class="content-grid"><article class="card animate">${section.content}</article></div>`;
    } else if (section.cards) {
        html += '<div class="content-grid">';
        section.cards.forEach(card => {
            html += `<article class="card animate">`;
            if (card.title) html += `<h3>${card.title}</h3>`;
            if (card.content) html += card.content;
            html += `</article>`;
        });
        html += '</div>';
    } else {
        const renderer = renderers[section.id];
        html += renderer ? renderer(config) : (sectionConfig.content ? `<div class="content-grid"><article class="card animate">${sectionConfig.content}</article></div>` : '');
    }

    html += '</section>';
    return html;
}

// Load configuration from YAML (parsed in browser via js-yaml CDN)
async function loadConfig() {
    const response = await fetch(`./config.yaml?t=${Date.now()}`, { cache: 'no-cache' });
    if (!response.ok) {
        throw new Error(`config.yaml not found: ${response.status}`);
    }
    const yamlText = await response.text();
    return jsyaml.load(yamlText);
}

// Build the entire page
async function buildPage(config) {
    window.siteConfig = config;

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    if (window.applyConfigThemeVars) {
        window.applyConfigThemeVars(currentTheme);
    }

    document.title = `${config.couple.names} - ${config.date.display}`;

    // Build navigation
    const navMenu = document.getElementById('nav-menu');
    config.sections.forEach(section => {
        if (section.enabled !== false) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${section.id}`;
            a.textContent = section.name;
            a.setAttribute('data-section', section.id);
            li.appendChild(a);
            navMenu.appendChild(li);
        }
    });

    // Build content
    const content = document.getElementById('content');
    let html = '';
    config.sections.forEach(section => {
        if (section.enabled !== false) {
            html += renderSection(section, config);
        }
    });
    content.innerHTML = html;

    // Build footer from config
    if (config.footer) {
        document.getElementById('footer-text').innerHTML = config.footer.text;
        document.getElementById('footer-links').innerHTML = `
            <a href="#" id="share-button" aria-label="Share this website">Share</a>
            <span aria-hidden="true">\u2022</span>
            <a href="${config.footer.github_url}" target="_blank" rel="noopener noreferrer">${config.footer.github_text}</a>
            <span aria-hidden="true">\u2022</span>
            <a href="${config.footer.stats_url}">${config.footer.stats_text}</a>
        `;
    }

    initializeFeatures(config);

    document.body.classList.add('config-loaded');

    const loader = document.getElementById('loader');
    loader.classList.add('fade-out');
    setTimeout(() => loader.remove(), LOADER_FADE_MS);
}

// --- Interactive features ---

function initializeFeatures(config) {
    // Smooth scrolling
    document.addEventListener('click', (e) => {
        if (e.target.matches('a[href^="#"]')) {
            e.preventDefault();
            const targetElement = document.getElementById(e.target.getAttribute('href').slice(1));
            if (targetElement) {
                document.querySelectorAll('#nav a').forEach(a => a.classList.remove('active'));
                e.target.classList.add('active');
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });

    // Navbar scroll effect
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                document.getElementById('nav').classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
                ticking = false;
            });
            ticking = true;
        }
    });

    // Intersection Observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });

    // Navigation tracking observer
    const sectionVisibility = new Map();
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.target.id) {
                sectionVisibility.set(entry.target.id, {
                    ratio: entry.intersectionRatio,
                    isIntersecting: entry.isIntersecting
                });
            }
        });

        let mostVisibleSection = null;
        let highestRatio = 0;
        for (const [sectionId, data] of sectionVisibility) {
            if (data.isIntersecting && data.ratio > highestRatio) {
                highestRatio = data.ratio;
                mostVisibleSection = sectionId;
            }
        }

        if (mostVisibleSection) {
            const navLink = document.querySelector(`#nav a[href="#${mostVisibleSection}"]`);
            if (navLink) {
                document.querySelectorAll('#nav a').forEach(a => a.classList.remove('active'));
                navLink.classList.add('active');
            }
        }
    }, { threshold: [0, 0.25, 0.5, 0.75, 1.0], rootMargin: '0px 0px -50% 0px' });

    requestAnimationFrame(() => {
        document.querySelectorAll('.animate').forEach(el => observer.observe(el));
        document.querySelectorAll('section[id]').forEach(section => navObserver.observe(section));
    });

    // Countdown timer
    if (config.date?.iso) {
        function updateCountdown() {
            const diff = new Date(config.date.iso) - new Date();
            if (diff > 0) {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                const countdownEl = document.getElementById('countdown');
                if (countdownEl) {
                    countdownEl.innerHTML = `
                        <div class="countdown-item"><div class="countdown-value">${days}</div><div class="countdown-label">Days</div></div>
                        <div class="countdown-item"><div class="countdown-value">${hours}</div><div class="countdown-label">Hours</div></div>
                        <div class="countdown-item"><div class="countdown-value">${minutes}</div><div class="countdown-label">Minutes</div></div>
                        <div class="countdown-item"><div class="countdown-value">${seconds}</div><div class="countdown-label">Seconds</div></div>
                    `;
                }
            }
        }
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    // Timeline navigation
    initializeTimeline();

    // Photo layout optimization
    initializePhotoLayouts();

    // Web Share API
    document.getElementById('share-button')?.addEventListener('click', async (e) => {
        e.preventDefault();
        if (navigator.share) {
            try {
                await navigator.share({
                    title: document.title,
                    text: `Join us for our wedding on ${config.date.display}!`,
                    url: window.location.href
                });
            } catch (err) {
                if (err.name !== 'AbortError') console.error('Share failed:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                const button = e.target;
                const originalText = button.textContent;
                button.textContent = 'Copied!';
                setTimeout(() => button.textContent = originalText, 2000);
            } catch (err) {
                console.error('Copy failed:', err);
            }
        }
    });
}

function initializeTimeline() {
    const timelineContainer = document.querySelector('.timeline-horizontal');
    const prevBtn = document.querySelector('.timeline-prev');
    const nextBtn = document.querySelector('.timeline-next');
    if (!timelineContainer || !prevBtn || !nextBtn) return;

    let currentIndex = 0;
    const items = document.querySelectorAll('.timeline-item-horizontal');
    const totalItems = items.length;
    const swipeHint = document.querySelector('.timeline-swipe-hint');

    // Hide the mobile swipe hint once the user reaches the end (or has interacted).
    function updateSwipeHint() {
        if (swipeHint) swipeHint.classList.toggle('hidden', currentIndex >= totalItems - 1);
    }

    function setEqualTimelineHeights() {
        const cards = document.querySelectorAll('.timeline-card');
        if (cards.length === 0) return;
        cards.forEach(card => card.style.height = 'auto');
        if (!isMobile()) {
            let maxHeight = 0;
            cards.forEach(card => { if (card.offsetHeight > maxHeight) maxHeight = card.offsetHeight; });
            cards.forEach(card => card.style.height = maxHeight + 'px');
        }
    }

    window.setEqualTimelineHeights = setEqualTimelineHeights;
    setEqualTimelineHeights();
    window.addEventListener('resize', setEqualTimelineHeights);

    function updateTimelinePosition() {
        if (totalItems === 0) return;
        const gap = isMobile() ? 0 : TIMELINE_GAP;
        const itemWidth = items[0].offsetWidth + gap;
        timelineContainer.scrollTo({ left: currentIndex * itemWidth, behavior: 'smooth' });

        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= totalItems - 1;

        items.forEach((item, index) => {
            const active = !isMobile() || index === currentIndex;
            item.style.opacity = active ? '1' : '0.7';
            item.style.transform = active ? 'scale(1)' : 'scale(0.95)';
        });

        updateSwipeHint();
    }

    function navigateTimeline(direction) {
        if (direction === 'prev' && currentIndex > 0) currentIndex--;
        else if (direction === 'next' && currentIndex < totalItems - 1) currentIndex++;
        updateTimelinePosition();
    }

    prevBtn.addEventListener('click', () => navigateTimeline('prev'));
    nextBtn.addEventListener('click', () => navigateTimeline('next'));
    updateTimelinePosition();

    // Touch/swipe on mobile
    if (isMobile()) {
        let startX = 0, startY = 0, scrollStart = 0, isDragging = false;

        timelineContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            scrollStart = timelineContainer.scrollLeft;
            isDragging = true;
            timelineContainer.style.scrollBehavior = 'auto';
            if (swipeHint) swipeHint.classList.add('hidden');
        });

        timelineContainer.addEventListener('touchmove', (e) => {
            if (!startX || !isDragging) return;
            const diffX = Math.abs(startX - e.touches[0].clientX);
            const diffY = Math.abs(startY - e.touches[0].clientY);
            if (diffX > diffY && diffX > 10) {
                e.preventDefault();
                timelineContainer.scrollLeft = scrollStart + (startX - e.touches[0].clientX);
            }
        }, { passive: false });

        timelineContainer.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            const endX = e.changedTouches[0].clientX;
            isDragging = false;
            timelineContainer.style.scrollBehavior = 'smooth';

            const itemWidth = items[0] ? items[0].offsetWidth : 300;
            const currentScrollIndex = timelineContainer.scrollLeft / itemWidth;
            let newIndex = Math.round(currentScrollIndex);

            if (Math.abs(endX - startX) > SWIPE_THRESHOLD) {
                newIndex = endX < startX
                    ? Math.min(Math.ceil(currentScrollIndex), totalItems - 1)
                    : Math.max(Math.floor(currentScrollIndex), 0);
            }

            currentIndex = Math.max(0, Math.min(newIndex, totalItems - 1));
            startX = 0;
            updateTimelinePosition();
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (timelineContainer.matches(':hover, :focus-within')) {
            if (e.key === 'ArrowLeft') { e.preventDefault(); navigateTimeline('prev'); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); navigateTimeline('next'); }
        }
    });
}

function initializePhotoLayouts() {
    function optimizePhotoLayouts() {
        document.querySelectorAll('.timeline-images-horizontal').forEach(container => {
            const photos = container.querySelectorAll('.timeline-photo');
            if (photos.length === 0) return;

            container.style.display = 'flex';
            container.style.flexDirection = 'column';

            container.querySelectorAll('.portrait-row').forEach(row => {
                while (row.firstChild) container.insertBefore(row.firstChild, row);
                row.remove();
            });

            processContainerPhotos(container, photos);
        });
    }

    function processContainerPhotos(container, photos) {
        let loadedCount = 0;

        photos.forEach((photo, index) => {
            if (photo.complete && photo.naturalWidth > 0) {
                loadedCount++;
            } else {
                photo.addEventListener('load', () => {
                    loadedCount++;
                    if (loadedCount === photos.length) arrangePhotos(container, photos);
                });
            }
        });

        if (loadedCount === photos.length) arrangePhotos(container, photos);
    }

    // Lay photos out as justified rows, choosing the row split that makes the
    // photos as large as possible while the whole gallery fits the available height.
    function arrangePhotos(container, photos) {
        const imgs = [...photos];
        const n = imgs.length;
        if (n === 0) return;

        const availableHeight = window.innerHeight - (isMobile() ? PHOTO_HEIGHT_OFFSET_MOBILE : PHOTO_HEIGHT_OFFSET_DESKTOP);
        const W = container.offsetWidth - PHOTO_WIDTH_OFFSET; // usable image-area width
        const FRAME = 16; // wrapper padding (both sides) added per photo
        const ar = imgs.map(p => (p.naturalWidth && p.naturalHeight) ? p.naturalWidth / p.naturalHeight : 1);

        // Evaluate one consecutive row split: each row fills the width, then the
        // whole block is scaled down (if needed) to fit availableHeight.
        function evaluate(rows) {
            const rowH = [];
            let total = 0;
            for (const row of rows) {
                const sumAr = row.reduce((s, i) => s + ar[i], 0);
                const innerW = W - PHOTO_GAP * (row.length - 1) - FRAME * row.length;
                const h = innerW / sumAr;
                rowH.push(h);
                total += h + FRAME;
            }
            total += PHOTO_GAP * (rows.length - 1);
            const scale = Math.min(1, availableHeight / total);
            let area = 0;
            rows.forEach((row, r) => {
                const h = rowH[r] * scale;
                row.forEach(i => { area += h * h * ar[i]; });
            });
            return { rows, rowH, scale, area };
        }

        // Enumerate every consecutive split of the photos into rows; keep the
        // one yielding the largest total photo area.
        let best = null;
        for (let mask = 0; mask < (1 << (n - 1)); mask++) {
            const rows = [[0]];
            for (let i = 1; i < n; i++) {
                if (mask & (1 << (i - 1))) rows.push([i]);
                else rows[rows.length - 1].push(i);
            }
            const cand = evaluate(rows);
            if (!best || cand.area > best.area) best = cand;
        }

        // Rebuild the gallery DOM into the chosen rows with explicit photo sizes.
        container.innerHTML = '';
        best.rows.forEach((row, r) => {
            const rowEl = document.createElement('div');
            rowEl.className = 'portrait-row';
            const h = Math.floor(best.rowH[r] * best.scale);
            row.forEach(i => {
                const wrap = document.createElement('div');
                wrap.className = 'timeline-image-wrapper';
                const img = imgs[i];
                img.style.height = h + 'px';
                img.style.width = Math.floor(h * ar[i]) + 'px';
                img.style.maxHeight = 'none';
                img.style.maxWidth = 'none';
                wrap.appendChild(img);
                rowEl.appendChild(wrap);
            });
            container.appendChild(rowEl);
        });
    }

    window.addEventListener('load', optimizePhotoLayouts);

    // Lazy load image height recalculation for timeline
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        if (img.closest('.timeline-card')) {
            img.addEventListener('load', () => {
                setTimeout(() => {
                    if (window.setEqualTimelineHeights) window.setEqualTimelineHeights();
                }, 50);
            });
        }
    });
}

// --- RSVP form ---

function initializeRSVPForm(config) {
    const form = document.getElementById('rsvp-form');
    if (!form) return;

    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const plusOneSection = document.getElementById('plus-one-section');
    const plusOneNameGroup = document.getElementById('plus-one-name-group');
    const hasPlusOneRadios = document.getElementsByName('hasPlusOne');
    const submitButton = document.getElementById('submit-button');
    const formMessage = document.getElementById('form-message');

    let guestCanHavePlusOne = false;

    async function checkGuestEligibility() {
        const firstName = firstNameInput.value.trim();
        const lastName = lastNameInput.value.trim();
        if (!firstName || !lastName) return;

        try {
            const url = `${config.rsvp.script_url}?action=getFormConfig&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}`;
            const response = await fetch(url, { method: 'GET', redirect: 'follow' });
            const data = await response.json();

            if (data.status === 'success') {
                guestCanHavePlusOne = data.showPlusOne;
                if (guestCanHavePlusOne) {
                    plusOneSection.classList.remove('hidden');
                    hasPlusOneRadios.forEach(radio => radio.required = true);
                } else {
                    plusOneSection.classList.add('hidden');
                    hasPlusOneRadios.forEach(radio => { radio.required = false; radio.checked = false; });
                    document.getElementById('plusOneName').required = false;
                    document.getElementById('plusOneName').value = '';
                    plusOneNameGroup.classList.add('hidden');
                }
            }
        } catch (error) {
            console.error('Error checking guest eligibility:', error);
        }
    }

    firstNameInput.addEventListener('blur', checkGuestEligibility);
    lastNameInput.addEventListener('blur', checkGuestEligibility);

    hasPlusOneRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'yes') {
                plusOneNameGroup.classList.remove('hidden');
                document.getElementById('plusOneName').required = true;
            } else {
                plusOneNameGroup.classList.add('hidden');
                document.getElementById('plusOneName').required = false;
                document.getElementById('plusOneName').value = '';
            }
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        formMessage.textContent = '';
        formMessage.className = 'form-message';

        const formData = {
            firstName: firstNameInput.value.trim(),
            lastName: lastNameInput.value.trim(),
            email: document.getElementById('email').value.trim(),
            attendingCeremony: document.querySelector('input[name="attendingCeremony"]:checked')?.value || '',
            attendingReception: document.querySelector('input[name="attendingReception"]:checked')?.value || '',
            dietaryRestrictions: document.getElementById('dietaryRestrictions').value.trim(),
            anythingElse: document.getElementById('anythingElse').value.trim()
        };

        if (guestCanHavePlusOne) {
            const hasPlusOne = document.querySelector('input[name="hasPlusOne"]:checked')?.value || 'no';
            formData.hasPlusOne = hasPlusOne;
            if (hasPlusOne === 'yes') {
                formData.plusOneName = document.getElementById('plusOneName').value.trim();
            }
        }

        try {
            const params = new URLSearchParams();
            for (const [key, value] of Object.entries(formData)) {
                params.append(key, value);
            }

            const response = await fetch(config.rsvp.script_url, {
                method: 'POST',
                redirect: 'follow',
                body: params
            });
            const data = await response.json();

            if (data.status === 'success') {
                showFormMessage(formMessage, '\u2713 ' + data.message + ' Thank you!', 'success');
                form.reset();
                plusOneSection.classList.add('hidden');
                plusOneNameGroup.classList.add('hidden');
                guestCanHavePlusOne = false;
            } else {
                showFormMessage(formMessage, '\u2717 ' + data.message, 'error');
            }
        } catch (error) {
            console.error('Error submitting RSVP:', error);
            showFormMessage(formMessage, '\u2717 Failed to submit RSVP. Please try again or contact us directly.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = config.rsvp.labels.submit_button;
        }
    });
}

// --- Init ---

async function init() {
    try {
        const config = await loadConfig();
        await buildPage(config);
        initializeRSVPForm(config);
    } catch (error) {
        console.error('Initialization failed:', error);
        document.getElementById('loader').innerHTML = `
            <div class="rsvp-wrapper">
                <div class="loader-icon">\u26A0\uFE0F</div>
                <p style="margin-top: 1rem;">Configuration Error</p>
                <p style="font-size: 0.875rem; opacity: 0.7;">Please check config.yaml</p>
            </div>
        `;
    }
}

init();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed:', err));
    });
}
