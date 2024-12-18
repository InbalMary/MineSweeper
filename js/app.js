'use strict'

// Board size
var ROWS = 4
var COLS = 4
var NUM_OF_MINES = 2

// Game elements
const MINE = '💣'
const FLAG = '🚩'
const EXPLOAD = '💥'

var gBoard
var gMinesPoss
var gMinesCounter

function onInitGame() {
    gBoard = buildBoard()
    gMinesPoss = setRandMinesPoss(gBoard, NUM_OF_MINES)
    gMinesCounter = NUM_OF_MINES
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
}

function buildBoard() {
    const board = createMat(ROWS, COLS)

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    // //Place two mimes
    // board[0][1].isMine = board[2][2].isMine = true

    // console.log(board)
    return board
}


function renderBoard(board) {
    const elBoard = document.querySelector('.board')
    var strHTML = ''

    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]

            var cellClass = getClassName({ i, j })
            if (currCell.isMine) cellClass += ' mine'
            if (currCell.minesAroundCount) cellClass += ' number'
            if (!currCell.isMine && !currCell.minesAroundCount) cellClass += ' empty'

            strHTML += `\t<td class="cell ${cellClass}" onclick="onCellClicked(this, ${i}, ${j})" 
                                oncontextmenu="onRightCellClicked(this, ${i}, ${j})">`
            strHTML += '</td>\n'
        }
        strHTML += '</tr>\n'
    }
    // console.log('strHTML is:')
    // console.log(strHTML)
    elBoard.innerHTML = strHTML
}

function getClassName(position) {
    const cellClass = `cell-${position.i}-${position.j}`
    return cellClass
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isMine) {
                var numOfNegs = countNegs(i, j, board)
                board[i][j].minesAroundCount = numOfNegs
            } else {
                board[i][j].minesAroundCount = null
            }
        }
    }
}

function countNegs(cellI, cellJ, mat) {
    var count = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue

            if (mat[i][j].isMine) count++
        }
    }
    return count
}

function onCellClicked(elCell, i, j) {
    const cell = gBoard[i][j]
    console.log('cell', cell, i, j)
    if (!cell.isShown && !cell.isMarked) {
        if (cell.isMine) {
            console.log('Game Over')
            elCell.innerText = MINE
            gameOver(elCell, i, j)
        } else {
            if (cell.minesAroundCount) elCell.innerText = cell.minesAroundCount;
        }
        cell.isShown = true
        if (gMinesCounter === 0) {
            checkGameOver()
        }
    }

    cell.isMarked = true
    console.log('negscount', cell.minesAroundCount)
}

function onRightCellClicked(elCell, i, j) {
    console.log('gMinesCounter', gMinesCounter)
    const cell = gBoard[i][j]
    console.log('cell', cell, i, j)

    if (!cell.isShown) {
        if (!cell.isMarked) {
            elCell.innerText = FLAG
            if (cell.isMine) gMinesCounter--
        } else {
            elCell.innerText = ''
            if (cell.isMine) gMinesCounter++
        }
        cell.isMarked = !cell.isMarked
    }
    if (gMinesCounter === 0) {
        checkGameOver()
    }
}

//hide the menu
document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
});

function gameOver() {
    for (var k = 0; k < gMinesPoss.length; k++) {
        // const mine = gMinesPoss[k]
        const elMine = document.querySelector(`.cell-${gMinesPoss[k].i}-${gMinesPoss[k].j}`)
        // console.log('elMine', elMine)
        elMine.innerText = EXPLOAD
    }
}

function onCellMarked(elCell) {

}

function checkGameOver() {
    console.log('checVic')
    var flag = 1
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j]
            if ((cell.isMine && cell.isMarked) || (!cell.isMine && cell.isShown)) {
                flag = 1
            } else {
                console.log('nooooo')
                return false
            }
        }
    }
    console.log('YOU WON')
    if (flag === 1) return true
}

function expandShown(board, elCell,
    i, j) {

}

function setRandMinesPoss(board, num) {
    var minesPoss = []
    var minesNum = 0
    while (minesNum < num) {
        var pos = { i: getRandomIntInclusive(0, ROWS - 1), j: getRandomIntInclusive(0, COLS - 1) }
        if (board[pos.i][pos.j].isMine === false) {
            // console.log('mine pos:', pos);
            board[pos.i][pos.j].isMine = true;
            minesPoss.push(pos)
            minesNum++
        }
    }
    return minesPoss
}

function onSetLevel(elLevel) {
    const gameLevel = elLevel.classList[0]
    switch (gameLevel) {
        case 'Beginner':
            ROWS = 4
            COLS = 4
            NUM_OF_MINES = 2
            break;
        case 'Medium':
            ROWS = 8
            COLS = 8
            NUM_OF_MINES = 14
            break;
        case 'Expert':
            ROWS = 12
            COLS = 12
            NUM_OF_MINES = 32
            break;
        default:
            break;
    }
    onInitGame()
}