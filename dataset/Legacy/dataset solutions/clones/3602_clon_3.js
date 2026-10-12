'use strict'

const computeProductOfDecrementedValues = (inputStringData) => {
    const numericParts = inputStringData.split(' ').map(strSegment => parseInt(strSegment, 10))
    const [firstValue, secondValue] = numericParts

    const adjustedFirst = firstValue - 1
    const adjustedSecond = secondValue - 1

    console.log(adjustedFirst * adjustedSecond)
}

computeProductOfDecrementedValues(require('fs').readFileSync('/dev/stdin', 'utf-8'))
