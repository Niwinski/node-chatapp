const board = document.getElementById("board");
const nextTileEl = document.getElementById("next-tile");
const nextTileLeft = document.getElementById("next-tile-1");
const nextTileRight = document.getElementById("next-tile-2");
const drawpile = document.getElementById("drawpile");
const popup = document.getElementById("popup-container");
const notification = document.getElementById("notification-container");
const allScoresEl = document.querySelectorAll(".terrain");
const scoreTotal = document.getElementById("score-total");
const undoBtn = document.getElementById("undo");
const restartBtn = document.getElementById("restart");

let curRot = 0;
let tiles = [];

const allPieces = [
    // field,water,plains,trees,swamp,mines
    { id: 1, terrain: ["f", "f"], crowns: [0, 0] },
    { id: 2, terrain: ["f", "f"], crowns: [0, 0] },
    { id: 3, terrain: ["t", "t"], crowns: [0, 0] },
    { id: 4, terrain: ["t", "t"], crowns: [0, 0] },
    { id: 5, terrain: ["t", "t"], crowns: [0, 0] },
    { id: 6, terrain: ["t", "t"], crowns: [0, 0] },
    { id: 7, terrain: ["w", "w"], crowns: [0, 0] },
    { id: 8, terrain: ["w", "w"], crowns: [0, 0] },

    { id: 9, terrain: ["w", "w"], crowns: [0, 0] },
    { id: 10, terrain: ["p", "p"], crowns: [0, 0] },
    { id: 11, terrain: ["p", "p"], crowns: [0, 0] },
    { id: 12, terrain: ["s", "s"], crowns: [0, 0] },
    { id: 13, terrain: ["f", "t"], crowns: [0, 0] },
    { id: 14, terrain: ["f", "w"], crowns: [0, 0] },
    { id: 15, terrain: ["f", "p"], crowns: [0, 0] },
    { id: 16, terrain: ["f", "s"], crowns: [0, 0] },

    { id: 17, terrain: ["t", "w"], crowns: [0, 0] },
    { id: 18, terrain: ["t", "p"], crowns: [0, 0] },
    { id: 19, terrain: ["f", "t"], crowns: [1, 0] },
    { id: 20, terrain: ["f", "w"], crowns: [1, 0] },
    { id: 21, terrain: ["f", "p"], crowns: [1, 0] },
    { id: 22, terrain: ["f", "s"], crowns: [1, 0] },
    { id: 23, terrain: ["f", "m"], crowns: [1, 0] },
    { id: 24, terrain: ["t", "f"], crowns: [1, 0] },

    { id: 25, terrain: ["t", "f"], crowns: [1, 0] },
    { id: 26, terrain: ["t", "f"], crowns: [1, 0] },
    { id: 27, terrain: ["t", "f"], crowns: [1, 0] },
    { id: 28, terrain: ["t", "w"], crowns: [1, 0] },
    { id: 29, terrain: ["t", "p"], crowns: [1, 0] },
    { id: 30, terrain: ["w", "f"], crowns: [1, 0] },
    { id: 31, terrain: ["w", "f"], crowns: [1, 0] },
    { id: 32, terrain: ["w", "t"], crowns: [1, 0] },

    { id: 33, terrain: ["w", "t"], crowns: [1, 0] },
    { id: 34, terrain: ["w", "t"], crowns: [1, 0] },
    { id: 35, terrain: ["w", "t"], crowns: [1, 0] },
    { id: 36, terrain: ["f", "p"], crowns: [0, 1] },
    { id: 37, terrain: ["w", "p"], crowns: [0, 1] },
    { id: 38, terrain: ["f", "s"], crowns: [0, 1] },
    { id: 39, terrain: ["p", "s"], crowns: [0, 1] },
    { id: 40, terrain: ["m", "f"], crowns: [1, 0] },

    { id: 41, terrain: ["f", "p"], crowns: [0, 2] },
    { id: 42, terrain: ["w", "p"], crowns: [0, 2] },
    { id: 43, terrain: ["f", "s"], crowns: [0, 2] },
    { id: 44, terrain: ["p", "s"], crowns: [0, 2] },
    { id: 45, terrain: ["m", "f"], crowns: [2, 0] },
    { id: 46, terrain: ["s", "m"], crowns: [0, 2] },
    { id: 47, terrain: ["s", "m"], crowns: [0, 2] },
    { id: 48, terrain: ["f", "m"], crowns: [0, 3] },
];

const scoreType = ["f", "w", "p", "t", "s", "m"];
const scoreBg = [
    [19, 0],
    [31, 0],
    [41, 1],
    [28, 0],
    [38, 1],
    [40, 0],
];

class Tile {
    constructor(dom, index) {
        this.dom = dom;
        this.id = index;
    }
    setInfo(id, side, t, c, rot) {
        console.log(`setting to ${t}`);
        this.terrain = t;
        this.crowns = c;
        this.pieceId = id;
        this.side = side;
        this.rot = rot;
        this.dom.style.backgroundImage = `url("./art/tile_${id}_${side}.jpg")`;
        this.dom.style.transform = `rotate(${rot}deg)`;
    }
    reset() {
        this.dom.style.backgroundImage = "";
        this.terrain = "";
    }
}

class Piece {
    constructor(t1, t2) {
        this.tiles = [t1, t2];
    }
}

function isUsed(index) {
    return tiles[index].terrain;
}

function showNotification(msg) {
    console.log("Notification " + msg);
    notification.classList.add("show");
    notification.innerText = msg;
    setTimeout(() => {
        notification.classList.remove("show");
    }, 1000);
}

//super hack
let crowns = 0;
let area = 0;
function addNeighbor(i, used, terrain) {
    // add myself
    if (used[i]) {
        return;
    }

    if (tiles[i].terrain == terrain) {
        used[i] = true;
        area++;
        crowns += tiles[i].crowns;
        // check left
        if (i % 5) {
            addNeighbor(i - 1, used, terrain);
        }
        // check right
        if ((i + 1) % 5) {
            addNeighbor(i + 1, used, terrain);
        }
        // check up
        if (i > 4) {
            addNeighbor(i - 5, used, terrain);
        }
        // check down
        if (i < 20) {
            addNeighbor(i + 5, used, terrain);
        }
    }
}

score = {};
function doScore() {
    let used = new Array(tiles.length);
    console.log("Checking Score");
    score = {};
    let total = 0;

    tiles.forEach((t, i) => {
        area = 0;
        crowns = 0;
        if (!used[i] && t.terrain) {
            addNeighbor(i, used, t.terrain, 0, 0);
            console.log(`Checked ${i} ${t.terrain} got ${area}, ${crowns}`);
            const points = area * crowns;
            if (!score[t.terrain]) {
                score[t.terrain] = 0;
            }
            score[t.terrain] += points;
            total += points;
        }
    });

    allScoresEl.forEach((e, i) => {
        const pts = score[scoreType[i]];
        if (pts) {
            e.innerHTML = `<div class="score">${pts}</div>`;
        } else {
            e.innerText = "";
        }
    });
    console.log(total);
    scoreTotal.innerHTML = total;
}

let nextPiece = 0;

function doNextPiece() {
    nextPiece++;
    nextTileLeft.style.backgroundImage = `url("./art/tile_${allPieces[nextPiece].id}_0.jpg")`;
    nextTileRight.style.backgroundImage = `url("./art/tile_${allPieces[nextPiece].id}_1.jpg")`;
    console.log(`Next piece ${nextPiece}`);
    doScore();
}

function addPieceToBoard(tile1) {
    const rot = curRot % 360; // noralize the rotation.
    const vert = rot == 90 || rot == 270;
    const tile2 = vert ? tile1 + 5 : tile1 + 1;
    const reverse = rot > 90;

    // do we have space
    if (isUsed(tile1) || isUsed(tile2)) {
        console.log("no space!");
        showNotification("No Space for this tile!!!");
        return;
    }

    const index1 = reverse ? 1 : 0;
    const index2 = reverse ? 0 : 1;
    const piece = allPieces[nextPiece];
    tiles[tile1].setInfo(piece.id, index1, piece.terrain[index1], piece.crowns[index1], rot);
    tiles[tile2].setInfo(piece.id, index2, piece.terrain[index2], piece.crowns[index2], rot);

    doNextPiece();
}

// make the board
function initBoard() {
    for (let i = 0; i < 25; i++) {
        const t = document.createElement("div");
        t.className = "tile";
        t.id = i;
        t.addEventListener("click", (e) => {
            addPieceToBoard(+e.target.id);
        });
        tiles.push(new Tile(t, i));
        board.appendChild(t);
    }

    allScoresEl.forEach((e, i) => {
        e.style.backgroundImage = `url("./art/tile_${scoreBg[i][0]}_${scoreBg[i][1]}.jpg")`;
    });
}
function shuffleDeck() {
    for (let i = 0; i < 300; i++) {
        const tile = Math.floor(Math.random() * allPieces.length);
        allPieces.push(...allPieces.splice(tile, 1));
    }
    console.log(allPieces);
}
function restartLevel() {
    tiles.forEach((t) => {
        t.reset();
    });
    tiles[12].setInfo(0, 0, ".", 0, 0);

    doScore();

    shuffleDeck();
    nextPiece = 0;

    doNextPiece();
}

initBoard();
restartLevel();

drawpile.addEventListener("click", () => {
    curRot = curRot + 90; // don't mod or the transform will be funny
    //    console.log(`setting rot to ${curRot}`);

    nextTileEl.style.transform = `rotate(${curRot}deg)`;
});

undo.addEventListener("click", () => {
    showNotification("Not supported Yet :(");
});

restart.addEventListener("click", () => {
    restartLevel();
});
