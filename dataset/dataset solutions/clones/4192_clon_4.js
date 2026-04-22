'use strict'

function evaluateNumericalProperty(sourceTextValue) {
    const rawNumericForm = Number(sourceTextValue)
    let digitAccumulation = 0
    let transientNumber = rawNumericForm

    while (transientNumber > 0) {
        digitAccumulation += transientNumber % 10
        transientNumber = Math.floor(transientNumber / 10)
    }

    const divisibilityCondition = Number.isInteger(rawNumericForm / digitAccumulation)
    const outcomeMapping = ['No', 'Yes']
    const finalOutcomeStatement = outcomeMapping[divisibilityCondition ? 1 : 0]

    console.log(finalOutcomeStatement)
}

const receivedPayload = require('fs').readFileSync('/dev/stdin', 'utf8')
evaluateNumericalProperty(receivedPayload)