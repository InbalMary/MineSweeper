'use strict'

var gIsHintClicked = false
var gGameLevel = 'Beginner'
var gCurTimer

var gStartTime
var gTimerInterval

var gHintCounter = 3
var gSafeLeft = 3
var gIsManualMode = false

function onGetHint(elHint) {
    if(!gHintCounter) return
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
                highlightSelected(i,j, 1000)
            }
        }
    }
}

function highlightSelected(i, j, time) {
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

function onSafeClick(elSafeBtn){
    if(!gSafeLeft) return
    gSafeLeft--
    var elSafeLeft = elSafeBtn.querySelector('.safeLefts span')
    elSafeLeft.innerText = gSafeLeft    
    showRandSafeCell()
}

function showRandSafeCell(){
    var pos = findEmptyPos()
    highlightSelected(pos.i, pos.j, 2000)   
}

function setSafeClicks(){
    var elSafeLeft = document.querySelector('.safeLefts span')
    elSafeLeft.innerText = gSafeLeft
}