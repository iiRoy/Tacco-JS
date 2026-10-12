'use strict'

function main(programInput) {
  const [firstOperand, secondOperand] = programInput.split('\n')

  const resultLabels = {
    greaterThan: 'GREATER',
    lessThan: 'LESS',
    equalValue: 'EQUAL'
  }

  let finalOutcome

  if (firstOperand === secondOperand) {
    finalOutcome = resultLabels.equalValue
  } else {
    const lengthOfFirst = firstOperand.length
    const lengthOfSecond = secondOperand.length

    if (lengthOfFirst !== lengthOfSecond) {
      finalOutcome = (lengthOfFirst > lengthOfSecond) ? resultLabels.greaterThan : resultLabels.lessThan
    } else {
      // Lengths are identical, and values are not equal, so a difference must exist.
      const firstChars = Array.from(firstOperand)
      const secondChars = Array.from(secondOperand)

      const differingCharIndex = firstChars.findIndex((charA, currentIdx) => charA !== secondChars[currentIdx])

      // Since lengths are equal and strings are not identical, differingCharIndex will always be found.
      const numericValA = Number(firstChars[differingCharIndex])
      const numericValB = Number(secondChars[differingCharIndex])

      finalOutcome = (numericValA > numericValB) ? resultLabels.greaterThan : resultLabels.lessThan
    }
  }

  console.log(finalOutcome)
}

main(require("fs").readFileSync("/dev/stdin", "utf8"))
