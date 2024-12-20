'use strict'

var gIsHintClicked = false
var gGameLevel = 'Beginner'
var gCurTimer

var gStartTime
var gTimerInterval

var gHintCounter = 3
var gSafeLeft = 3
var gIsManualMode = false
var gIsDarkMode = true
var gIsUndo = false
var gAllMoves
var gAllExpansions = []
var gExterminatedMineCount = 0
var gMega = {
    gIsMegaHint: false,
    gIsFirstMegaStep: false,
    gMegaPoss: []
}

function onGetHint(elHint) {
    if (!gHintCounter) return
    gHintCounter--
    console.log('elHint', elHint)
    gIsHintClicked = true
    elHint.classList.add('lighted')
}

function handelHint(elCell, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            // if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= gBoard[0].length) continue
            var currCell = gBoard[i][j]

            if (!currCell.isShown || i === rowIdx && j === colIdx) {
                highlightSelected(i, j, 1000)
            }
        }
    }
}

function highlightSelected(i, j, time) {
    console.log('mega')
    const elNeg = document.querySelector(`.cell-${i}-${j}`)
    const origText = elNeg.innerText
    // console.log('elNeg', elNeg)
    elNeg.classList.add('selected')
    if (gBoard[i][j].minesAroundCount) elNeg.innerText = gBoard[i][j].minesAroundCount
    if (gBoard[i][j].isMine) elNeg.innerText = MINE

    setTimeout(() => {
        elNeg.classList.remove('selected')
        elNeg.innerText = origText
    }, time)
}

function setHints() {
    const elHints = document.querySelectorAll('.hint')
    for (var i = 0; i < elHints.length; i++) {
        elHints[i].classList.remove('lighted')
    }
}

function updateTimer() {
    const elapsedTime = Date.now() - gStartTime
    const elTimer = document.querySelector('.timer')

    elTimer.innerText = (elapsedTime / 1000).toFixed(2)
}

function stopTimer() {
    clearInterval(gTimerInterval) // Stops the timer  
    const elapsedTime = (Date.now() - gStartTime) / 1000
    gCurTimer = (Date.now() - gStartTime) / 1000
    gCurTimer = elapsedTime.toFixed(2)
}

function restartTimer() {
    clearInterval(gTimerInterval) // Clear the existing timer
    timerReset()
    gStartTime = Date.now() // Reset start time
    gTimerInterval = setInterval(updateTimer, 10) // Restart the timer
}

function timerReset() {
    const elTimer = document.querySelector('.timer')
    elTimer.innerText = "0.00"
}

function updateBestScore(level, score) {
    var elBest = document.querySelector('.best-score')
    elBest.innerHTML = `${level} Level <br> Best Score: ${score} seconds!`
}

function checkScore(level, timeDiff) {
    const levelKey = `bestScore_${level}`
    const lastHighScore = parseFloat(localStorage.getItem(levelKey))
    console.log('cur timediff', timeDiff)

    if (isNaN(lastHighScore) || timeDiff < lastHighScore) {
        localStorage.setItem(levelKey, timeDiff)
        return timeDiff
    }
    return lastHighScore
}

function setBestScore(level) {
    const levelKey = `bestScore_${level}`
    const bestScore = parseFloat(localStorage.getItem(levelKey))
    var elLevel = document.querySelector('.best-score')
    elLevel.innerHTML = isNaN(bestScore) ? `${level} Level <br> Best Score: No score yet!` : `${level} Level <br> Best Score: ${bestScore} seconds!`
}

function onSafeClick(elSafeBtn) {
    if (!gSafeLeft) return
    gSafeLeft--
    var elSafeLeft = elSafeBtn.querySelector('.safeLefts span')
    elSafeLeft.innerText = gSafeLeft
    showRandSafeCell()
}

function showRandSafeCell() {
    var pos = findEmptyPos()
    highlightSelected(pos.i, pos.j, 2000)
}

function setSafeClicks() {
    var elSafeLeft = document.querySelector('.safeLefts span')
    elSafeLeft.innerText = gSafeLeft
}

function onManualMode(elMan) {
    gIsManualMode = true
    elMan.classList.add('lighted')
}

function resetManualMode() {
    var elMan = document.querySelector('.manual')
    elMan.classList.remove('lighted')
}

function hideManualMines() {
    for (var k = 0; k < gMinesPoss.length; k++) {
        var pos = gMinesPoss[k]
        var elMine = document.querySelector(`.cell-${pos.i}-${pos.j}`)
        elMine.innerText = ''
    }
}

function onMegaHint(elMega) {
    gMega.gIsMegaHint = true
    elMega.classList.add('lighted')
}

function resetMegaHint() {
    var elMega = document.querySelector('.mega')
    elMega.classList.remove('lighted')
}

function handelMegaHint(poss) {
    if (!poss || poss.length !== 2) return

    var rowIdxStart = Math.min(poss[0].i, poss[1].i)
    var rowIdxEnd = Math.max(poss[0].i, poss[1].i)
    var colIdxStart = Math.min(poss[0].j, poss[1].j)
    var colIdxEnd = Math.max(poss[0].j, poss[1].j)

    for (var i = rowIdxStart; i <= rowIdxEnd; i++) {
        for (var j = colIdxStart; j <= colIdxEnd; j++) {
            console.log('i, j', i, j)
            highlightSelected(i, j, 2500)
            resetMegaHint()
        }
    }
    gMega.gMegaPoss = []
}

function onDarkMode(elBtn) {
    const elBody = document.querySelector('.dark')
    if (gIsDarkMode) {
        elBtn.innerText = 'Dark Mode🌃'
        elBody.classList.add('day-light')
    } else {
        elBtn.innerText = 'DayLight🌞'
        elBody.classList.remove('day-light')
    }
    // elBtn.innerText = gIsDarkMode ? 'Dark Mode🌃' : 'DayLight🌞'
    gIsDarkMode = !gIsDarkMode
}

function onUndo() { 
    gIsUndo = true
    console.log('gAllMoves:', gAllMoves)
    var pos = gAllMoves.splice(gAllMoves.length - 1, 1)[0]
    if (!pos) return
    // console.log('pos', pos)
    // console.log('gAllMoves', gAllMoves)

    const elCell = document.querySelector(`.cell-${pos.i}-${pos.j}`)
    var cell = gBoard[pos.i][pos.j]
    // console.log('cell', cell, elCell)
    
    if (cell.isMarked) { //flaged
        cell.isMarked = false
        elCell.innerText = ''
        gNumOfMarked++
        renderMarkedCounter(gNumOfMarked)
    }

    // console.log('variableeeeeeeee', gAllExpansions[gAllExpansions.length-1][gAllExpansions.length-1][0].i)
    if(pos.i === gAllExpansions[gAllExpansions.length-1][gAllExpansions.length-1][0].i &&
        pos.j === gAllExpansions[gAllExpansions.length-1][gAllExpansions.length-1][0].j){
            handelHideExpension()
        }
    if (cell.isShown) { //num, empty, mine
        elCell.classList.remove('selected')      
        elCell.innerText = ''

        if (cell.isMine) {
            gNumOfMarked++
            console.log('mineeee gNumOfMarked', gNumOfMarked)
            renderMarkedCounter(gNumOfMarked)
            cell.isShown = false
            return
        }
        cell.isShown = false
    } 

}

function handelHideExpension(){
    var len = gAllExpansions[gAllExpansions.length-1][gAllExpansions.length-1].length
    // console.log('len:', len)
    for(var i=1; i<len; i++){
        // console.log('variableI', gAllExpansions[gAllExpansions.length-1][gAllExpansions.length-1][i].i)
        var curI= gAllExpansions[gAllExpansions.length-1][gAllExpansions.length-1][i].i
        var curJ = gAllExpansions[gAllExpansions.length-1][gAllExpansions.length-1][i].j
        var cell = gBoard[curI][curJ]
        const elCell = document.querySelector(`.cell-${curI}-${curJ}`)
        // const elCell = document.querySelector(`.cell-${gAllExpansions[gAllExpansions.length-1][gAllExpansions.length-1][i].i}-${gAllExpansions[gAllExpansions.length-1][gAllExpansions.length-1][i].j}`)
        elCell.classList.remove('selected')  
        elCell.innerText = ''
        cell.isShown = false
    }
}

function onExterminator(elBtn){
    // console.log('gNumOfMarked', gNumOfMarked)
    if(gNumOfMarked < 3) return
    // console.log('gMinesPoss before', gMinesPoss)
    while(gExterminatedMineCount < 3){
        var randMineIdx = getRandomIntInclusive(0, gMinesPoss.length)
        // console.log('randMineIdx', randMineIdx)
        var randMinePos = gMinesPoss[randMineIdx]
        // console.log('randMinePos', randMinePos)

        if(gBoard[randMinePos.i][randMinePos.j].isMine && !gBoard[randMinePos.i][randMinePos.j].isShown){
            gBoard[randMinePos.i][randMinePos.j].isMine = false
            gMinesPoss.splice(randMinePos, 1)[0]
        }
        gNumOfMarked--
        gMinesCounter--
        gExterminatedMineCount++
    }
    renderMarkedCounter(gNumOfMarked)
    setMinesNegsCount(gBoard)
    // console.log('gMinesPoss after', gMinesPoss)
}