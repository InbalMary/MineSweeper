'use strict'

//default values
var ROWS = 4
var COLS = 4
var NUM_OF_MINES = 2

// Game elements
const MINE = '💣'
const FLAG = '🚩'
const EXPLOAD = '💥'

const NORMAL = '🤓'
const LOSE = '🤯'
const WIN = '🤩'

// Globals
var gBoard
var gMinesPoss
var gMinesCounter
var gLivesCounter = 3
var gNumOfMarked = 0
var gIsFirstClick = true


function onInitGame() {
    stopTimer()
    timerReset()
    gIsFirstClick = true
    gHintCounter = 3
    gSafeLeft = 3
    gIsManualMode = false
    gMega.gIsMegaHint = false
    gMega.gMegaPoss = []
    gMinesPoss = []
    gAllMoves = []
    gExterminatedMineCount = 0
    setRestartBtn(NORMAL)
    setLives()
    setHints()
    setSafeClicks()
    resetManualMode()
    gBoard = buildBoard()
    renderBoard(gBoard)
    renderMarkedCounter('')
}

function startGame(firstRowIdx, firstColIdx) {
    if (gMinesPoss.length === NUM_OF_MINES) {
        // console.log('Using manual mode', gMinesPoss)
        hideManualMines()
    } else {
        gMinesPoss = setRandMinesPoss(gBoard, NUM_OF_MINES, firstRowIdx, firstColIdx)
    }
    gMinesCounter = NUM_OF_MINES
    gNumOfMarked = NUM_OF_MINES
    setMinesNegsCount(gBoard)
}

function buildBoard() {
    const board = createMat(ROWS, COLS)

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
        }
    }
    // //Place two mimes
    // board[0][1].isMine = board[2][2].isMine = true
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
            // if (currCell.isMine) cellClass += ' mine'
            // if (currCell.minesAroundCount) cellClass += ' number'
            // if (!currCell.isMine && !currCell.minesAroundCount) cellClass += ' empty'

            strHTML += `\t<td class="cell ${cellClass}" onclick="onCellClicked(this, ${i}, ${j})" 
                                oncontextmenu="onRightCellClicked(this, ${i}, ${j})">`
            strHTML += '</td>\n'
        }
        strHTML += '</tr>\n'
    }
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

function onCellClicked(elCell, i, j) { //left
    gAllMoves.push({ i, j })
    if (gMega.gIsMegaHint && !gMega.gIsFirstMegaStep) {
        gMega.gIsFirstMegaStep = true
        gMega.gMegaPoss.push({ i, j })
        return
    }

    if (gMega.gIsMegaHint && gMega.gIsFirstMegaStep) {
        gMega.gIsMegaHint = false
        gMega.gIsFirstMegaStep = false
        gMega.gMegaPoss.push({ i, j })
        handelMegaHint(gMega.gMegaPoss)
        return
    }

    if (gIsHintClicked) {
        handelHint(elCell, i, j)
        gIsHintClicked = false
        return
    }

    if (gIsManualMode) {
        if (gBoard[i][j].isMine) return
        // renderMarkedCounter(NUM_OF_MINES)
        gBoard[i][j].isMine = true
        gMinesPoss.push({ i, j })
        elCell.innerText = MINE
        setMinesNegsCount(gBoard)
        renderMarkedCounter(NUM_OF_MINES - gMinesPoss.length)

        if (gMinesPoss.length === NUM_OF_MINES) {
            gIsManualMode = false
            gIsFirstClick = true

            setTimeout(() => {
                hideAllmines()
            }, 1000)
        }
        return
    }

    if (gIsFirstClick) {
        restartTimer()
        gNumOfMarked = NUM_OF_MINES
        renderMarkedCounter(NUM_OF_MINES)
        gIsFirstClick = false
        startGame(i, j)
    }

    const cell = gBoard[i][j]
    console.log('cell', cell, i, j)
    if (!cell.isShown && !cell.isMarked) {
        if (cell.isMine) {
            if (gLivesCounter > 0) {
                elCell.innerText = MINE
                if (!gIsHintClicked) gLivesCounter--
                gMinesCounter--
                gNumOfMarked--
                renderMarkedCounter(gNumOfMarked)

                var elLives = document.querySelectorAll('.lives')
                elLives[gLivesCounter].classList.add('hidden')
                // console.log('gLivesCounter', gLivesCounter)
            } else {
                console.log('Game Over')
                gameOver(elCell, i, j)
            }

        } else {
            elCell.classList.add('selected')
            if (cell.minesAroundCount) {
                elCell.innerText = cell.minesAroundCount
            }
            else {
                gAllExpansions[gAllExpansions.length] = []
                gAllExpansions[gAllExpansions.length - 1][gAllExpansions.length - 1] = []


                gAllExpansions[gAllExpansions.length - 1][gAllExpansions.length - 1].push({ i, j })
                console.log('variable', i, j)
                expandShown(gBoard, i, j)
            }
        }
        cell.isShown = true
        if (gMinesCounter === 0) {
            checkGameOver()
        }
    }
}

function onRightCellClicked(elCell, i, j) {
    console.log('gMinesCounter', gMinesCounter)
    const cell = gBoard[i][j]

    if (!cell.isShown && !cell.isMarked && gNumOfMarked <= 0) return
    gAllMoves.push({ i, j })

    if (!cell.isShown) {
        if (!cell.isMarked) {
            elCell.innerText = FLAG
            gNumOfMarked--
            renderMarkedCounter(gNumOfMarked)
            if (cell.isMine) {
                gMinesCounter--
            }
        } else {
            elCell.innerText = ''
            gNumOfMarked++
            renderMarkedCounter(gNumOfMarked)
            if (cell.isMine) {
                gMinesCounter++
            }
        }
        cell.isMarked = !cell.isMarked
    }
    if (gMinesCounter === 0 || gNumOfMarked === 0) {
        checkGameOver()
    }
}

//hide the menu
document.addEventListener('contextmenu', function (event) {
    event.preventDefault()
})

function gameOver() {
    for (var k = 0; k < gMinesPoss.length; k++) {
        const elMine = document.querySelector(`.cell-${gMinesPoss[k].i}-${gMinesPoss[k].j}`)
        // console.log('elMine', elMine)
        elMine.innerText = EXPLOAD
    }
    setRestartBtn(LOSE)
    stopTimer()
}

function checkGameOver() {
    // console.log('checVic')
    var flag = 1
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j]
            if ((cell.isMine && cell.isMarked) || (!cell.isMine && cell.isShown) || (cell.isMine && cell.isShown)) {
                flag = 1
            } else {
                console.log('nooooo')
                return false
            }
        }
    }
    console.log('YOU WON')
    setRestartBtn(WIN)
    stopTimer()
    var bestScore = checkScore(gGameLevel, gCurTimer)
    updateBestScore(gGameLevel, bestScore)
    if (flag === 1) return true
}

function expandShown(mat, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue

            const neg = mat[i][j]
            if (neg.isShown || neg.isMarked) continue

            console.log('gAllExpansions[gAllExpansions.length-1]', gAllExpansions[gAllExpansions.length - 1])
            gAllExpansions[gAllExpansions.length - 1][gAllExpansions.length - 1].push({ i, j })
            console.log('gAllExpansions', gAllExpansions)
            neg.isShown = true
            const elNeg = document.querySelector(`.cell-${i}-${j}`)
            elNeg.classList.add('selected')

            if (neg.minesAroundCount) elNeg.innerText = neg.minesAroundCount
            else expandShown(mat, i, j)
        }
    }
}



function setRandMinesPoss(board, num, firstRowIdx, firstColIdx) {
    var minesPoss = []
    var minesNum = 0
    while (minesNum < num) {
        var pos = { i: getRandomIntInclusive(0, ROWS - 1), j: getRandomIntInclusive(0, COLS - 1) }
        if (pos.i === firstRowIdx && pos.j === firstColIdx) continue
        if (board[pos.i][pos.j].isMine === false) {
            console.log('mine pos:', pos)
            board[pos.i][pos.j].isMine = true
            minesPoss.push(pos)
            minesNum++
        }
    }
    return minesPoss
}

function onSetLevel(elLevel) {
    const gameLevel = elLevel.classList[0]
    gIsFirstClick = true
    gGameLevel = gameLevel
    setLives()
    setBestScore(gameLevel)

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

function setRestartBtn(state) {
    var elLose = document.querySelector('.restart')
    elLose.innerText = state
}

function setLives() {
    gLivesCounter = 3

    const elLives = document.querySelectorAll('.lives')
    for (var i = 0; i < elLives.length; i++) {
        elLives[i].classList.remove('hidden')
    }
}

function renderMarkedCounter(markedCount) {
    var elMinesCount = document.querySelector('.mines-left span')
    console.log('variable', elMinesCount)
    elMinesCount.innerText = markedCount
}


function hideAllmines() {
    for (var i = 0; i < gMinesPoss.length; i++) {
        const elMine = document.querySelector(`.cell-${gMinesPoss[i].i}-${gMinesPoss[i].j}`)
        elMine.classList.remove('selected')
        elMine.innerText = ''
    }
}