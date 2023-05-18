let N = 0;
let LIMIT = 5;
let WORD_COUNT = 0;
let WORD = "";
let LOADING = false;
let GUESS_WORD;

async function getWord() {
    const promise = await fetch("https://words.dev-apis.com/word-of-the-day?random=1")
    const processedPromise = await promise.json()
    return processedPromise.word
}

async function isWord() {
    const promise = await fetch("https://words.dev-apis.com/validate-word", {
        method: "POST",
        body: JSON.stringify({"word": WORD})
    });
    return promise.json();
}

function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

function checkWordLength() {
    if (N < LIMIT) {
        N++;
        return true;
    }
    else {
        return false;
    }
}

function appendLetter(key) {
    if (!checkWordLength()) {
        return;
    }
    const square = document.querySelector(`.letter-${N}`);
    const p = document.createElement("p");
    p.innerText = key;
    if (square != null) {
        square.appendChild(p);
        WORD = WORD + key;
    }
}

function removeLetter() {
    if (N != (LIMIT - 5)) {
        const square = document.querySelector(`.letter-${N}`);
        if (square != null) {
            square.removeChild(square.firstChild);
            WORD = WORD.slice(0, -1)
            N--;
        }
    }
}

function flashBorderRed() {
    const squares = []
    for (let i = 0; i < 5; i++) {
        const square = document.querySelector(`.letter-${WORD_COUNT * 5 + i + 1}`);
        square.classList.add("red-flash")
        squares.push(square)
    }
    setTimeout(function () {
        squares.forEach((e) => {
            e.classList.remove("red-flash")
        })
    }, 1000);
}

async function nextWord() {
    LOADING = true
    isLoading(LOADING)
    const correctWord = await isWord();
    if (!correctWord.validWord) {
        LOADING = false
        isLoading(LOADING)
        flashBorderRed()
        return;
    }
    colorSquares()
    if (await handleWin())
    {
        isLoading(false)
        return;
    }
    if (N === LIMIT) {
        LIMIT += 5;
        WORD_COUNT++;
        WORD = "";
    }
    await handleLoss()
    LOADING = false
    isLoading(LOADING)
}

function colorSquares() {
    const map = makeMap(GUESS_WORD)
    for (let i = 0; i < 5; i++) {
        const square = document.querySelector(`.letter-${WORD_COUNT * 5 + i + 1}`);
        if (WORD[i] === GUESS_WORD[i]) {
            square.style.backgroundColor = "rgb(79, 183, 79)";
            map[WORD[i]]--;
        }
    }
    for (let i = 0; i < 5; i++) {
        const square = document.querySelector(`.letter-${WORD_COUNT * 5 + i + 1}`);
        if (WORD[i] === GUESS_WORD[i]) {
            // do nothing
        }
        else if (GUESS_WORD.includes(WORD[i]) && map[WORD[i]] > 0) {
            square.style.backgroundColor = "rgb(235, 225, 80)";
            map[WORD[i]]--;
        }
        else {
            square.style.backgroundColor = "rgb(150, 150, 150)";
        }
    }
}

async function compareWords() {
    if (GUESS_WORD === WORD) {
        return true
    }
}

async function handleWin() {
    if (N === LIMIT && await compareWords()) {
        const winModal = document.querySelector(".win-modal");
        winModal.showModal();
        return true
    }
}

async function handleLoss() {
    const word = GUESS_WORD
    if (WORD_COUNT === 6) {
        const lossModal = document.querySelector(".loss-modal");
        const msg = document.createElement("p");
        msg.innerHTML = `You lost! The word was <b>${word.toUpperCase()}</b>.`
        lossModal.prepend(msg)
        lossModal.showModal();
        lossModal.addEventListener('cancel', function(event) {
            event.preventDefault();
        });
    }
}

function isLoading(bool) {
    const spinner = document.querySelector(".spinner");
    if (bool) {
        spinner.style.visibility = "visible";
    }
    else {
        spinner.style.visibility = "hidden";
    }
}

function makeMap (guess) {
    const obj = {};
    for (let i = 0; i < guess.length; i++) {
        if (obj[guess[i]]) {
            obj[guess[i]]++;
        }
        else {
            obj[guess[i]] = 1
        }
    }
    return obj
}

async function init() {
    GUESS_WORD = await getWord()
    document.addEventListener('keyup', function(event) {
        if (LOADING) {
            return;
        }
        else {
            if (isLetter(event.key)) {
                appendLetter(event.key);
            }
            if (event.key === "Backspace") {
                removeLetter();
            }
            if (event.key === "Enter") {
                nextWord();
            }
        }
    });
}

init()