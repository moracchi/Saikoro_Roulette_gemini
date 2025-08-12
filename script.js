// DOM要素を先に取得しておく
const dice = document.getElementById('dice');
const diceNumber = document.getElementById('dice-number');
const startButton = document.getElementById('start-button');
const historyList = document.getElementById('history-list');
const confettiContainer = document.getElementById('confetti-container');
const bonusMessage = document.getElementById('bonus-message');
const countSpans = { 1: document.getElementById('count-1'), 2: document.getElementById('count-2'), 3: document.getElementById('count-3'), 4: document.getElementById('count-4'), 5: document.getElementById('count-5'), 6: document.getElementById('count-6') };
// BGMコントロールボタン
const bgm1Button = document.getElementById('bgm1-button');
const bgm2Button = document.getElementById('bgm2-button');
const bgmOffButton = document.getElementById('bgm-off-button');

// --- 音声ファイルの読み込み ---
// ※注意：音声ファイルがない場合、エラーになりますがアプリの動作は継続します。

// 効果音
const sounds = {
    spinStart: new Audio('./sounds/spin-start.mp3'),
    spinning: new Audio('./sounds/spinning.mp3'),
    results: { 1: new Audio('./sounds/result-1.mp3'), 2: new Audio('./sounds/result-2.mp3'), 3: new Audio('./sounds/result-3.mp3'), 4: new Audio('./sounds/result-4.mp3'), 5: new Audio('./sounds/result-5.mp3'), 6: new Audio('./sounds/result-6.mp3') }
};
sounds.spinning.loop = true;

// BGM
const bgm = {
    1: new Audio('./sounds/music1.mp3'),
    2: new Audio('./sounds/music2.mp3'),
};
bgm[1].loop = true;
bgm[2].loop = true;

// --- アプリの状態管理 ---
let isSpinning = false;
let history = [];
const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
let spinInterval;
let currentBgm = null; // 現在再生中のBGMトラック番号 ('1', '2', or null)

// --- イベントリスナーの設定 ---
startButton.addEventListener('click', startRoulette);
bgm1Button.addEventListener('click', () => setBgm(1));
bgm2Button.addEventListener('click', () => setBgm(2));
bgmOffButton.addEventListener('click', () => setBgm(null));

// --- BGM制御 ---
function setBgm(trackNumber) {
    // すべてのBGMを停止
    if (bgm[1] && !bgm[1].paused) bgm[1].pause();
    if (bgm[2] && !bgm[2].paused) bgm[2].pause();

    if (trackNumber) {
        // 指定されたBGMを再生
        bgm[trackNumber].currentTime = 0;
        bgm[trackNumber].play().catch(error => {
            console.warn(`BGMの再生に失敗。ユーザー操作が必要です:`, error);
        });
        currentBgm = trackNumber.toString();
    } else {
        // BGMをOFFにする
        currentBgm = null;
    }
    updateBgmButtons();
}

function updateBgmButtons() {
    [bgm1Button, bgm2Button, bgmOffButton].forEach(btn => btn.classList.remove('active'));
    if (currentBgm === '1') {
        bgm1Button.classList.add('active');
    } else if (currentBgm === '2') {
        bgm2Button.classList.add('active');
    } else {
        bgmOffButton.classList.add('active');
    }
}

// --- メインロジック ---
function startRoulette() {
    if (isSpinning) return;
    isSpinning = true;
    startButton.disabled = true;
    startButton.textContent = '回転中...';
    dice.className = 'dice'; 
    void dice.offsetWidth; 
    diceNumber.textContent = '';

    playSound(sounds.spinStart);
    playSound(sounds.spinning);
    vibrate(50);

    dice.classList.add('spinning');
    spinInterval = setInterval(() => {
        diceNumber.textContent = Math.floor(Math.random() * 6) + 1;
    }, 80);

    setTimeout(showResult, 2500);
}

function showResult() {
    clearInterval(spinInterval);
    sounds.spinning.pause();
    sounds.spinning.currentTime = 0;
    dice.classList.remove('spinning');

    const result = Math.floor(Math.random() * 6) + 1;
    diceNumber.textContent = result;
    dice.classList.add('result-show', `result-${result}`);
    playSound(sounds.results[result]);

    if (result === 6) {
        vibrate([100, 30, 100, 30, 200]);
        triggerJackpotEffect();
    } else {
        vibrate(100);
    }

    updateHistory(result);
    updateSummary(result);

    setTimeout(() => {
        isSpinning = false;
        startButton.disabled = false;
        startButton.textContent = 'もう一回！';
        dice.className = 'dice floating';
        dice.classList.add(`result-${result}`);
    }, 2000);
}

// --- 履歴・集計・演出 ---
function updateHistory(result) {
    history.unshift(result);
    if (history.length > 10) history.pop();
    historyList.innerHTML = '';
    history.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        historyList.appendChild(li);
    });
    checkStreak();
}

function updateSummary(result) {
    counts[result]++;
    countSpans[result].textContent = counts[result];
}

function checkStreak() {
    if (history.length >= 3 && history[0] === history[1] && history[1] === history[2]) {
        showBonusMessage(`🎉 ${history[0]}が3連続！ 🎉`);
    }
}

function showBonusMessage(message) {
    bonusMessage.textContent = message;
    bonusMessage.classList.add('show');
    setTimeout(() => bonusMessage.classList.remove('show'), 2500);
}

function triggerJackpotEffect() {
    const colors = ['#ff6347', '#ffd700', '#98fb98', '#87cefa', '#ffb6c1', '#f0f8ff'];
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = `${Math.random() * 0.5}s`;
        confetti.style.animationDuration = `${3 + Math.random() * 2}s`;
        confetti.style.transform = `scale(${0.7 + Math.random() * 0.6}) rotate(${Math.random() * 360}deg)`;
        confettiContainer.appendChild(confetti);
        setTimeout(() => confetti.remove(), 5000);
    }
}

// --- ヘルパー関数 ---
function playSound(audio) {
    audio.currentTime = 0;
    audio.play().catch(error => console.log("効果音の再生に失敗:", error));
}

function vibrate(pattern) {
    if ('vibrate' in navigator) {
        try {
            navigator.vibrate(pattern);
        } catch (error) {
            console.log("バイブレーションに失敗:", error);
        }
    }
}