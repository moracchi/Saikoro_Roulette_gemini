// DOM要素を先に取得しておく
const dice = document.getElementById('dice');
const diceNumber = document.getElementById('dice-number');
const startButton = document.getElementById('start-button');
const historyList = document.getElementById('history-list');
const confettiContainer = document.getElementById('confetti-container');
const bonusMessage = document.getElementById('bonus-message');
const countSpans = {
    1: document.getElementById('count-1'),
    2: document.getElementById('count-2'),
    3: document.getElementById('count-3'),
    4: document.getElementById('count-4'),
    5: document.getElementById('count-5'),
    6: document.getElementById('count-6'),
};

// 音声ファイルを読み込み
const sounds = {
    spinStart: new Audio('./sounds/spin-start.mp3'),
    spinning: new Audio('./sounds/spinning.mp3'),
    results: {
        1: new Audio('./sounds/result-1.mp3'), 2: new Audio('./sounds/result-2.mp3'),
        3: new Audio('./sounds/result-3.mp3'), 4: new Audio('./sounds/result-4.mp3'),
        5: new Audio('./sounds/result-5.mp3'), 6: new Audio('./sounds/result-6.mp3'),
    }
};
sounds.spinning.loop = true;

// アプリの状態を管理する変数
let isSpinning = false;
let history = [];
const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
let spinInterval; // 回転中の数字切り替え用タイマー

// スタートボタンがクリックされた時の処理
startButton.addEventListener('click', startRoulette);

function startRoulette() {
    if (isSpinning) return;
    isSpinning = true;

    startButton.disabled = true;
    startButton.textContent = '回転中...';

    // 演出クラスをリセットし、待機アニメーションを停止
    dice.className = 'dice'; 
    void dice.offsetWidth; // 強制リフローでアニメーションリセット
    diceNumber.textContent = ''; // 数字を一旦消す

    playSound(sounds.spinStart);
    playSound(sounds.spinning);
    vibrate(50); // スマホで軽く振動

    dice.classList.add('spinning');

    // 回転中に数字を高速で切り替える
    spinInterval = setInterval(() => {
        const randomFace = Math.floor(Math.random() * 6) + 1;
        diceNumber.textContent = randomFace;
    }, 80);

    setTimeout(showResult, 2500); // 回転時間を少し長く
}

function showResult() {
    clearInterval(spinInterval); // 数字の切り替えを停止

    sounds.spinning.pause();
    sounds.spinning.currentTime = 0;
    dice.classList.remove('spinning');

    const result = Math.floor(Math.random() * 6) + 1;
    diceNumber.textContent = result;
    
    // 結果に応じた演出クラスを追加
    dice.classList.add('result-show', `result-${result}`);
    
    playSound(sounds.results[result]);

    // ジャックポット演出！
    if (result === 6) {
        vibrate([100, 30, 100, 30, 200]); // 派手な振動
        triggerJackpotEffect();
    } else {
        vibrate(100); // 通常の振動
    }

    updateHistory(result);
    updateSummary(result);

    setTimeout(() => {
        isSpinning = false;
        startButton.disabled = false;
        startButton.textContent = 'もう一回！';
        
        // 演出用クラスをリセットし、待機アニメーションを再開
        dice.className = 'dice floating';
        dice.classList.add(`result-${result}`); // 結果の背景色だけ残す
    }, 2000); // 結果表示後の待機時間を少し長く
}

// 履歴を更新し、ゾロ目をチェックする関数
function updateHistory(result) {
    history.unshift(result);
    if (history.length > 10) {
        history.pop();
    }

    historyList.innerHTML = '';
    history.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        historyList.appendChild(li);
    });

    checkStreak(); // ゾロ目チェック
}

// 集計を更新する関数
function updateSummary(result) {
    counts[result]++;
    countSpans[result].textContent = counts[result];
}

// ゾロ目ボーナスをチェックする関数
function checkStreak() {
    if (history.length >= 3) {
        if (history[0] === history[1] && history[1] === history[2]) {
            showBonusMessage(`🎉 ${history[0]}が3連続！ 🎉`);
        }
    }
}

// ボーナスメッセージを表示する関数
function showBonusMessage(message) {
    bonusMessage.textContent = message;
    bonusMessage.classList.add('show');
    setTimeout(() => {
        bonusMessage.classList.remove('show');
    }, 2500); // 2.5秒後にメッセージを消す
}

// ジャックポットの紙吹雪を生成する関数
function triggerJackpotEffect() {
    const colors = ['#ff6347', '#ffd700', '#98fb98', '#87cefa', '#ffb6c1', '#f0f8ff'];
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = `${Math.random() * 0.5}s`;
        confetti.style.animationDuration = `${3 + Math.random() * 2}s`;
        const scale = 0.7 + Math.random() * 0.6;
        confetti.style.transform = `scale(${scale}) rotate(${Math.random() * 360}deg)`;
        
        confettiContainer.appendChild(confetti);
        
        // アニメーション終了後に要素を削除してDOMを軽くする
        setTimeout(() => confetti.remove(), 5000);
    }
}

// 音声再生用のヘルパー関数
function playSound(audio) {
    audio.currentTime = 0;
    audio.play().catch(error => {
        console.log("音声の再生に失敗しました。ユーザー操作後に再試行されます。", error);
    });
}

// バイブレーション用のヘルパー関数
function vibrate(pattern) {
    if ('vibrate' in navigator) {
        try {
            navigator.vibrate(pattern);
        } catch (error) {
            console.log("バイブレーションに失敗しました。", error);
        }
    }
}