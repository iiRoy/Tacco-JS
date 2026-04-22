const ProcessInput = (rawData) => {
  const textLines = rawData.split('\n')
  const climateObservations = textLines[0].toString().split('')
  let occurrenceCounter = 0

  climateObservations.reduce((previousSymbol, currentSymbol) => {
    if (previousSymbol === 'R' && currentSymbol === 'R') {
      occurrenceCounter++
    }
    if (previousSymbol === '' && currentSymbol === 'R') {
      occurrenceCounter++
    }
    return currentSymbol
  }, '')

  console.log(occurrenceCounter)
}

ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'))