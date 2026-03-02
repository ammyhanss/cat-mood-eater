// ---- State ----
let currentPose = 'sit'; // 'sit' | 'lazy'
let poseTimer = null;
let badgeTimer = null;

const catSit = document.getElementById('cat-sit');
const catLazy = document.getElementById('cat-lazy');
const catEat = document.getElementById('cat-eat');
const catHead = document.getElementById('cat-head');
const paperBall = document.getElementById('paper-ball');
const nomBubble = document.getElementById('nom-bubble');
const countBadge = document.getElementById('count-badge');
const countNum = document.getElementById('count-num');

// ---- Init ----
async function init() {
    const count = await window.catAPI.getTodayCount();
    updateCount(count);
    startPoseRotation();

    // Show count badge briefly on startup
    showBadge(3000);
}

// ---- Pose rotation: randomly switch between sit & lazy ----
function startPoseRotation() {
    const interval = 15000 + Math.random() * 20000; // 15–35s
    poseTimer = setTimeout(() => {
        togglePose();
        startPoseRotation();
    }, interval);
}

function togglePose() {
    if (currentPose === 'sit') {
        setPose('lazy');
    } else {
        setPose('sit');
    }
}

function setPose(pose) {
    catSit.classList.remove('active');
    catLazy.classList.remove('active');
    catEat.classList.remove('active');

    if (pose === 'sit') {
        catSit.classList.add('active');
    } else if (pose === 'lazy') {
        catLazy.classList.add('active');
    } else if (pose === 'eat') {
        catEat.classList.add('active');
    }
    currentPose = pose;
}

// ---- Click head: open editor ----
catHead.addEventListener('click', (e) => {
    e.stopPropagation();
    console.log('[cat-widget] head clicked, catAPI:', typeof window.catAPI);
    if (window.catAPI) {
        window.catAPI.openEditor();
    } else {
        console.error('[cat-widget] catAPI not available! Preload may have failed.');
    }
});

// ---- Receive feed-cat event from main process ----
window.catAPI.onFeedCat(async () => {
    triggerEatAnimation();
    const count = await window.catAPI.getTodayCount();
    updateCount(count);
    showBadge(4000);
});

// ---- Eat animation sequence ----
function triggerEatAnimation() {
    // 1. Throw paper ball
    paperBall.classList.remove('throwing');
    void paperBall.offsetWidth; // reflow to reset animation
    paperBall.classList.add('throwing');

    // 2. After ball reaches cat mouth (~600ms), switch to eat pose
    setTimeout(() => {
        setPose('eat');
        showNomBubble();
    }, 550);

    // 3. After eating animation (1s), return to sit or lazy
    setTimeout(() => {
        nomBubble.classList.remove('show');
        const prevPose = Math.random() > 0.5 ? 'sit' : 'lazy';
        setPose(prevPose);
        currentPose = prevPose;
    }, 2200);
}

function showNomBubble() {
    nomBubble.classList.add('show');
    setTimeout(() => {
        nomBubble.classList.remove('show');
    }, 1500);
}

// ---- Count badge ----
function updateCount(n) {
    countNum.textContent = n;
}

function showBadge(duration = 3000) {
    clearTimeout(badgeTimer);
    countBadge.classList.add('visible');
    badgeTimer = setTimeout(() => {
        countBadge.classList.remove('visible');
    }, duration);
}

// Show badge on hover
document.addEventListener('mouseover', () => showBadge(2500));

// ---- Start ----
init();
