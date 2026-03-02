const moodInput = document.getElementById('mood-input');
const throwBtn = document.getElementById('throw-btn');
const charCount = document.getElementById('char-count');
const charBarFill = document.getElementById('char-bar-fill');
const throwOverlay = document.getElementById('throw-overlay');
const animatedBall = document.getElementById('animated-ball');

const MAX_CHARS = 500;

// ---- Char counter ----
moodInput.addEventListener('input', () => {
    const len = moodInput.value.length;
    charCount.textContent = len;

    const pct = (len / MAX_CHARS) * 100;
    charBarFill.style.width = pct + '%';

    // Color feedback: green → orange → red
    if (pct < 60) {
        charBarFill.style.background = '#ff9933';
    } else if (pct < 85) {
        charBarFill.style.background = '#ff6600';
    } else {
        charBarFill.style.background = '#ff3300';
    }

    throwBtn.disabled = len === 0;
});

// ---- Keyboard shortcut: Cmd+Enter to throw ----
moodInput.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && moodInput.value.trim()) {
        triggerThrow();
    }
    // ESC closes
    if (e.key === 'Escape') {
        window.close();
    }
});

// ---- Throw button ----
throwBtn.addEventListener('click', () => {
    if (!moodInput.value.trim()) return;
    triggerThrow();
});

// ---- Trigger throw animation then save ----
function triggerThrow() {
    const text = moodInput.value.trim();
    if (!text) return;

    // Disable input during animation
    moodInput.disabled = true;
    throwBtn.disabled = true;

    // Show overlay
    throwOverlay.classList.add('active');

    // Animate ball
    animatedBall.classList.remove('throw');
    void animatedBall.offsetWidth; // reflow
    animatedBall.classList.add('throw');

    // Crumple input text visually
    moodInput.style.transition = 'all 0.4s ease';
    moodInput.style.transform = 'scale(0.95)';
    moodInput.style.opacity = '0.3';

    // After animation completes, save & close
    setTimeout(() => {
        window.catAPI.saveEntry(text);
        // window will be closed by main process after save
    }, 650);
}
