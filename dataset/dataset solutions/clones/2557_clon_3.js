"use strict"

let inputDataString = require('fs').readFileSync('/dev/stdin', 'UTF-8')
inputDataString = inputDataString.split('\n')

const extractGameParameters = (lineContent) => {
    const parameterParts = lineContent.split(' ')
    const totalPlayers = parseInt(parameterParts[0], 10)
    const initialPlayerPoints = parseInt(parameterParts[1], 10)
    const totalQuestions = parseInt(parameterParts[2], 10)
    return { totalPlayers, initialPlayerPoints, totalQuestions }
}

const { totalPlayers: playerCount, initialPlayerPoints: initialPoints, totalQuestions: questionCount } = extractGameParameters(inputDataString[0])

const correctQuestionAnswerers = inputDataString.slice(1).map(entry => parseInt(entry, 10))

let playerScores = Array.from({ length: playerCount }, () => initialPoints - questionCount)

correctQuestionAnswerers.forEach(answererIndex => {
    const adjustedIndex = answererIndex - 1
    playerScores[adjustedIndex]++
})

const outputPlayerStatus = (currentScore) => {
    if (currentScore > 0) {
        console.log('Yes')
    } else {
        console.log('No')
    }
}

playerScores.forEach(scoreValue => {
    outputPlayerStatus(scoreValue)
})
