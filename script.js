// --- KONFIGURASI DATA ---

// Masukkan Link Embed Spotify (Pastikan linknya format 'embed' atau sesuai instruksi)
const spotifyList = [
    {
        title: "Lagu Kita",
        link: "https://open.spotify.com/embed/artist/6AjW1aE0OlIoRGdnwbHgP2?si=QY4GaarRQcGbOdoXl2h4Nw" // Ganti dengan link embed asli
    },
    {
        title: "Playlist Galau",
        link: "https://open.spotify.com/embed/artist/51kyrUsAVqUBcoDEMFkX12?si=nEiMt23ASfyGlCd85hr_9w" // Ganti dengan link embed asli
    }
];

const photos = [
    { src: "Foto1.png", caption: "Kenangan Pertama" },
    { src: "Foto2.png", caption: "Jalan-jalan" },
    { src: "Foto3.png", caption: "Senyum Kamu Manis!" }
];

const letterText = `
    Hai Sayang! ❤️<br><br>
    Meskipun tidak ada Lilin di atas kue tart yang dinyalakan, jangan padamkan nyala doa di hari kelahiran. 
    Jangan padamkan harapan dari doa-doa yang sempat dipanjatkan.<br><br>
    I Love You!
`;

// --- SYSTEM VARIABLES ---
let state = "MENU"; // MENU, LETTER, GALLERY, MUSIC, GAME
let menuIdx = 0;
let photoIdx = 0;
let musicIdx = 0;
let audio = document.getElementById('bgm');
let gameInterval; 

// --- DOM ELEMENTS ---
const menuScreen = document.getElementById('menu-screen');
const appScreen = document.getElementById('app-screen');
const menuItems = document.querySelectorAll('.menu-item');

// --- INPUT CONTROLLER ---
function input(key) {
    if (state === "MENU") handleMenu(key);
    else if (state === "LETTER") handleBack(key);
    else if (state === "GALLERY") handleGallery(key);
    else if (state === "MUSIC") handleMusic(key);
    else if (state === "GAME") handleGame(key);
}

// Keyboard Support
document.addEventListener('keydown', (e) => {
    if(e.key === "ArrowUp") input("UP");
    if(e.key === "ArrowDown") input("DOWN");
    if(e.key === "ArrowLeft") input("LEFT");
    if(e.key === "ArrowRight") input("RIGHT");
    if(e.key === "Enter") input("A"); 
    if(e.key === "Backspace" || e.key === "Escape") input("B"); 
});

// --- MENU LOGIC ---
function handleMenu(key) {
    // Hanya ada 4 Menu sekarang (0, 1, 2, 3)
    if (key === "DOWN") menuIdx = (menuIdx + 1) % 4;
    if (key === "UP") menuIdx = (menuIdx - 1 + 4) % 4;
    if (key === "A") openApp(menuIdx);
    
    updateMenuUI();
}

function updateMenuUI() {
    menuItems.forEach((item, index) => {
        if (index === menuIdx) item.classList.add('selected');
        else item.classList.remove('selected');
    });
}

function openApp(index) {
    menuScreen.classList.remove('active');
    menuScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');
    
    // Reset kelas gallery mode setiap buka aplikasi
    appScreen.classList.remove('gallery-mode');
    
    if (index === 0) loadLetter();
    if (index === 1) loadGallery();
    if (index === 2) loadMusic();
    if (index === 3) initGame();
}

function backToMenu() {
    if (state === "GAME") clearInterval(gameInterval);

    state = "MENU";
    appScreen.innerHTML = "";
    appScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
    menuScreen.classList.add('active');
}

function handleBack(key) {
    if (key === "B") backToMenu();
}

// --- APPS FEATURES ---

// 1. SURAT
function loadLetter() {
    state = "LETTER";
    appScreen.innerHTML = `<div class="scroll-text">${letterText}</div>`;
}

// 2. GALERI
function loadGallery() {
    state = "GALLERY";
    photoIdx = 0;
    appScreen.classList.add('gallery-mode'); // Tambahkan mode layar penuh
    renderPhoto();
}

function renderPhoto() {
    const p = photos[photoIdx];
    appScreen.innerHTML = `
        <img src="${p.src}" class="gallery-full-img">
        <div class="gallery-caption-overlay">${p.caption}</div>
    `;
}

function handleGallery(key) {
    if (key === "RIGHT") { photoIdx = (photoIdx + 1) % photos.length; renderPhoto(); }
    if (key === "LEFT") { photoIdx = (photoIdx - 1 + photos.length) % photos.length; renderPhoto(); }
    if (key === "B") backToMenu();
}

// 3. MUSIK
function loadMusic() {
    state = "MUSIC";
    if(audio) audio.pause(); 
    renderMusicUI();
}

function renderMusicUI() {
    const song = spotifyList[musicIdx];
    appScreen.innerHTML = `
        <div class="music-container" style="padding: 10px; height: 100%; display: flex; flex-direction: column; justify-content: center;">
            <h3 style="font-size:12px; margin-bottom:10px; color:#555;">${song.title}</h3>
            
            <iframe style="border-radius:12px" 
                src="${song.link}" 
                width="100%" 
                height="152" 
                frameBorder="0" 
                allowfullscreen="" 
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy">
            </iframe>

            <p style="font-size:9px; margin-top:15px; color:#aaa">
                <i class="fas fa-caret-up"></i> Ganti Lagu <i class="fas fa-caret-down"></i>
            </p>
        </div>
    `;
}

function handleMusic(key) {
    if (key === "UP" || key === "RIGHT") { 
        musicIdx = (musicIdx + 1) % spotifyList.length; 
        renderMusicUI(); 
    }
    if (key === "DOWN" || key === "LEFT") { 
        musicIdx = (musicIdx - 1 + spotifyList.length) % spotifyList.length; 
        renderMusicUI(); 
    }
    if (key === "B") backToMenu();
}

// 4. TETRIS GAME
let board = [];
let score = 0;
let currentPiece;
const ROWS = 15;
const COLS = 10;
const COLORS = [null, '#ff6b81', '#ffa502', '#2ed573', '#1e90ff', '#a55eea', '#ff4757', '#5352ed'];

function initGame() {
    state = "GAME";
    score = 0;
    board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
    appScreen.innerHTML = `
        <div style="position:relative; width:100%; height:100%; background:#2f3542; display:flex; justify-content:center;">
            <canvas id="tetris" width="150" height="250" style="background:#000; display:block;"></canvas>
            <div style="position:absolute; top:10px; left:10px; color:white; font-size:10px;">Score: <span id="score">0</span></div>
        </div>
    `;
    
    currentPiece = newPiece();
    drawGame();
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 1000);
}

function newPiece() {
    const pieces = 'ILJOTSZ';
    const type = pieces[Math.floor(Math.random() * pieces.length)];
    let shape;
    if(type==='I') shape=[[1,1,1,1]];
    else if(type==='L') shape=[[0,0,1],[1,1,1]];
    else if(type==='J') shape=[[1,0,0],[1,1,1]];
    else if(type==='O') shape=[[1,1],[1,1]];
    else if(type==='Z') shape=[[1,1,0],[0,1,1]];
    else if(type==='S') shape=[[0,1,1],[1,1,0]];
    else if(type==='T') shape=[[0,1,0],[1,1,1]];

    const color = Math.floor(Math.random() * 7) + 1;
    return { shape, color, x: Math.floor(COLS/2) - Math.floor(shape[0].length/2), y: 0 };
}

function drawGame() {
    const canvas = document.getElementById('tetris');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const BLOCK_SIZE = canvas.width / COLS;

    ctx.fillStyle = '#2f3542';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    board.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val > 0) {
                ctx.fillStyle = COLORS[val];
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE-1, BLOCK_SIZE-1);
            }
        });
    });

    if(currentPiece) {
        ctx.fillStyle = COLORS[currentPiece.color];
        currentPiece.shape.forEach((row, y) => {
            row.forEach((val, x) => {
                if (val) {
                    ctx.fillRect((currentPiece.x + x) * BLOCK_SIZE, (currentPiece.y + y) * BLOCK_SIZE, BLOCK_SIZE-1, BLOCK_SIZE-1);
                }
            });
        });
    }
}

function gameLoop() {
    currentPiece.y++;
    if (collision()) {
        currentPiece.y--;
        merge();
        clearLines();
        currentPiece = newPiece();
        if (collision()) gameOver();
    }
    drawGame();
}

function collision() {
    for(let y = 0; y < currentPiece.shape.length; y++) {
        for(let x = 0; x < currentPiece.shape[y].length; x++) {
            if(currentPiece.shape[y][x] !== 0) {
                let boardY = y + currentPiece.y;
                let boardX = x + currentPiece.x;
                if(boardY >= ROWS || boardX < 0 || boardX >= COLS || board[boardY][boardX] !== 0) return true;
            }
        }
    }
    return false;
}

function merge() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val) board[y + currentPiece.y][x + currentPiece.x] = currentPiece.color;
        });
    });
}

function clearLines() {
    for(let y = ROWS - 1; y >= 0; y--) {
        if(board[y].every(val => val !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            score += 100;
            document.getElementById('score').innerText = score;
            y++;
        }
    }
}

function rotate() {
    const prevShape = currentPiece.shape;
    currentPiece.shape = currentPiece.shape[0].map((val, index) => currentPiece.shape.map(row => row[index]).reverse());
    if (collision()) currentPiece.shape = prevShape;
}

function handleGame(key) {
    if (key === "LEFT") { currentPiece.x--; if(collision()) currentPiece.x++; }
    if (key === "RIGHT") { currentPiece.x++; if(collision()) currentPiece.x--; }
    if (key === "DOWN") { currentPiece.y++; if(collision()) { currentPiece.y--; merge(); clearLines(); currentPiece = newPiece(); if(collision()) gameOver(); } }
    if (key === "A") rotate();
    if (key === "B") backToMenu();
    drawGame();
}

function gameOver() {
    clearInterval(gameInterval);
    appScreen.innerHTML = `
        <div style="height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:20px; background:#fff;">
            <h3 style="color:#ff6b81; margin-bottom:10px;">INGET YA!</h3>
            <p style="font-size:13px; color:#555;">Walaupun kamu kalah,</p>
            <p style="font-size:13px; color:#555;">tapi kamu selalu menang</p>
            <p style="font-size:13px; color:#555;">kok di hati aku, HEHE ^_^</p>
            <h2 style="color:#ff4757; margin-top:15px;">I LOVE YOU <3</h2>
            <button onclick="initGame()" style="margin-top:20px; padding:8px 20px; background:#ff6b81; color:white; border:none; border-radius:20px;">Main Lagi</button>
            <button onclick="backToMenu()" style="margin-top:10px; padding:5px 10px; background:none; border:none; color:#888; font-size:10px;">Kembali ke Menu</button>
        </div>
    `;
}