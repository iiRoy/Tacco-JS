'use strict'

function ProcessInput(sourceText) {
  const dataRows = sourceText.split('\n')
  const initialCount = parseInt(dataRows[0])
  const heightSequence = dataRows[1].split(' ').map(Number)

  const finalState = heightSequence.reduce((accumulator, currentLevel) => {
    const addedAmount = Math.max(0, currentLevel - accumulator.priorValue)
    return {
      accumulatedSum: accumulator.accumulatedSum + addedAmount,
      priorValue: currentLevel
    }
  }, { accumulatedSum: 0, priorValue: 0 })

  console.log(finalState.accumulatedSum)
}
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'))
