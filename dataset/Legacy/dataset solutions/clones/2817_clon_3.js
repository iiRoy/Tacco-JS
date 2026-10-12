'use strict'

function main(inputStringData) {
  const processedString = inputStringData.trim()
  const stringComponents = processedString.split(' ')

  const numericValues = stringComponents.map(currentStringValue => {
    return Number(currentStringValue)
  })

  const firstOperand = numericValues[0]
  const secondOperand = numericValues[1]

  let computedResult

  if (firstOperand < secondOperand) {
    computedResult = 0
  } else {
    computedResult = 10
  }

  console.log(computedResult)
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))
