// DOM要素を先に取得しておく
const dice = document.getElementById('dice');
const diceNumber = document.getElementById('dice-number');
const startButton = document.getElementById('start-button');
const historyList = document.getElementById('history-list');
const countSpans = {
    1: document.getElementById('count-1'),
    2: document.getElementById('count-2'),
    3: document.getElementById('count-3'),
    4: document.getElementById('count-4'),
    5: document.getElementById('count-5'),
    6: document.getElementById('count-6'),
};

// 音声ファイルを読み込み（ファイルパスは適宜修正してください）
// ※注意：音声ファイルがない場合、エラーになりますが動作はします。
const sounds = {
    spinStart: new Audio('./sounds/spin-start.mp3'),
    spinning: new Audio('./sounds/spinning.mp3'),
    results: {
        1: new Audio('./sounds/result-1.mp3'),
        2: new Audio('./sounds/result-2.mp3'),
        3: new Audio('./sounds/result-3.mp3'),
        4: new Audio('./sounds/result-4.mp3'),
        5: new Audio('./sounds/result-5.mp3'),
        6: new Audio('./sounds/result-6.mp3'), // ジャックポット音！
    }
};
// スピン中の音はループ再生する
sounds.spinning.loop = true;

// アプリの状態を管理する変数
let isSpinning = false; // 回転中かどうかのフラグ
let history = []; // 出目の履歴を保存する配列
const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }; // 出目の集計

// スタートボタンがクリックされた時の処理
startButton.addEventListener('click', startRoulette);

function startRoulette() {
    // 回転中にボタンが押されても何もしない
    if (isSpinning) {
        return;
    }
    isSpinning = true;

    // ボタンを無効化し、テキストを変更
    startButton.disabled = true;
    startButton.textContent = '回転中...';

    // 演出用のクラスとテキストをリセット
    dice.className = 'dice'; // アニメーションクラスを一旦すべて削除
    void dice.offsetWidth; // リフローを強制してアニメーションをリセット
    diceNumber.textContent = '?';

    // --- 回転開始 ---
    // 音声を再生
    playSound(sounds.spinStart);
    playSound(sounds.spinning);

    // 回転アニメーションを開始
    dice.classList.add('spinning');

    // 2秒後に結果を表示する（この時間を調整して期待感を演出）
    setTimeout(showResult, 2000);
}

function showResult() {
    // --- 結果表示 ---
    // 回転を停止
    sounds.spinning.pause();
    sounds.spinning.currentTime = 0; // 次回再生のために再生位置をリセット
    dice.classList.remove('spinning');

    // 1から6までのランダムな整数を生成
    const result = Math.floor(Math.random() * 6) + 1;

    // 結果の数値を表示
    diceNumber.textContent = result;

    // 結果に応じた演出クラスを追加
    dice.classList.add('result-show'); // 共通の登場アニメーション
    dice.classList.add(`result-${result}`); // 出目ごとのスタイル

    // 結果に応じた音声を再生
    playSound(sounds.results[result]);

    // 履歴と集計を更新
    updateHistory(result);
    updateSummary(result);

    // 演出が終わった後にボタンを再度有効化する（1.5秒後）
    setTimeout(() => {
        isSpinning = false;
        startButton.disabled = false;
        startButton.textContent = 'もう一回！';
        
        // 6の演出後など、スタイルが残る場合があるのでリセット
        dice.className = 'dice';
        // 色だけは残しておくと分かりやすいので、結果のクラスは残す
        dice.classList.add(`result-${result}`);
    }, 1500);
}

// 履歴を更新する関数
function updateHistory(result) {
    // 履歴配列の先頭に新しい結果を追加
    history.unshift(result);
    // 履歴は最新10件まで保持
    if (history.length > 10) {
        history.pop();
    }

    // 表示を更新
    historyList.innerHTML = ''; // 一旦リストを空にする
    history.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        historyList.appendChild(li);
    });
}

// 集計を更新する関数
function updateSummary(result) {
    counts[result]++;
    countSpans[result].textContent = counts[result];
}

// 音声再生用のヘルパー関数（エラーハンドリング付き）
function playSound(audio) {
    // 再生位置を最初に戻してから再生
    audio.currentTime = 0;
    audio.play().catch(error => {
        // ユーザーがページを操作するまで音声再生がブロックされることがあるため
        console.log("音声の再生に失敗しました:", error);
    });
}
