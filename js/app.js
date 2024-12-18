'use strict'

// Board size
const ROWS = 4
const COLS = 4

// Game elements
const MINE = '💣'

var gBoard

function onInitGame() {
    gBoard = buildBoard()
    // setRandMinesPoss(gBoard, 2)
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
    board[0][1].isMine = board[2][2].isMine = true

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

            strHTML += `\t<td class="cell ${cellClass}" onclick="onCellClicked(this, ${i}, ${j})">`

            // if (currCell.isMine) strHTML += MINE
            // if(currCell.minesAroundCount) strHTML += currCell.minesAroundCount

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
    cell.isShown = true

    // model update
    if (cell.isMine) {
        console.log('Game Over')
        elCell.innerText = MINE
    }
    else if (!cell.isMine && !cell.isMarked) {
        elCell.innerText = cell.minesAroundCount
    }
    //DOM update

    cell.isMarked = true
    console.log('negscount', cell.minesAroundCount)
}


function onCellMarked(elCell) {

}

function checkGameOver() {

}

function expandShown(board, elCell,
    i, j) {

}

function setRandMinesPoss(board, num) {
    for (var k = 0; k < num; k++) {
        var pos = { i: getRandomIntInclusive(0, ROWS - 1), j: getRandomIntInclusive(0, COLS - 1) }
        if (board[pos.i][pos.j].isMine === false) {
            // console.log('mine pos:', pos);
            board[pos.i][pos.j].isMine = true;
        }
    }
}