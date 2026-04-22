'use strict'

function processGameData(rawContent) {
  const linesArray = rawContent.trim().split('\n')

  const firstLineData = linesArray[0].split(' ').map(val => parseInt(val))
  const totalPlays = firstLineData[0]
  const coolDownPeriod = firstLineData[1]

  const secondLineData = linesArray[1].split(' ').map(val => parseInt(val))
  const rockScore = secondLineData[0]
  const scissorsScore = secondLineData[1]
  const paperScore = secondLineData[2]

  const opponentSequenceStr = linesArray[2]

  const scoreLookup = {
    'r': paperScore,
    's': rockScore,
    'p': scissorsScore
  }

  // Recursive function to calculate total points
  // currentPlayIndex: The current round's index
  // lastWinTimes: An object storing the index of the last round a specific hand type ('r', 's', 'p') scored points
  function computeTotalPoints(currentPlayIndex, lastWinTimes) {
    // Base case: If all rounds have been processed, return 0 additional points
    if (currentPlayIndex === totalPlays) {
      return 0
    }

    const opponentMoveAtCurrent = opponentSequenceStr[currentPlayIndex]
    let currentRoundPoints = 0
    // Create a new object for the next recursive call to maintain immutability
    const nextWinTimes = { ...lastWinTimes }

    const timeOfLastWinForThisMove = lastWinTimes[opponentMoveAtCurrent]

    // Check if the coolDownPeriod has passed since the last win with this specific move type
    // If currentPlayIndex - timeOfLastWinForThisMove is >= coolDownPeriod, then we can score
    if (currentPlayIndex - timeOfLastWinForThisMove >= coolDownPeriod) {
      currentRoundPoints = scoreLookup[opponentMoveAtCurrent]
      // Update the last win time for this move type to the current index
      nextWinTimes[opponentMoveAtCurrent] = currentPlayIndex
    } else {
      // If we cannot score, points are 0, and the last win time for this move type remains unchanged
      nextWinTimes[opponentMoveAtCurrent] = timeOfLastWinForThisMove
    }

    // Add current round's points to the sum of points from subsequent rounds
    return currentRoundPoints + computeTotalPoints(currentPlayIndex + 1, nextWinTimes)
  }

  // Initialize lastWinTimes such that any move at index 0 will satisfy the coolDownPeriod condition
  // By setting them to -coolDownPeriod, for index 0, 0 - (-coolDownPeriod) = coolDownPeriod, which is >= coolDownPeriod
  const initialWinHistory = {
    'r': -coolDownPeriod,
    's': -coolDownPeriod,
    'p': -coolDownPeriod
  }

  const finalResult = computeTotalPoints(0, initialWinHistory)
  console.log(finalResult)
}

processGameData(require("fs").readFileSync("/dev/stdin", "utf8"));