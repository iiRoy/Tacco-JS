"use strict"
function main(inputData) {
    const [alpha, beta, gamma, kappa] = inputData.trim().split("\n")[0].split(" ").map(Number)

    const cardDefinitions = [
        { quantity: alpha, value: 1 },
        { quantity: beta, value: 0 },
        { quantity: gamma, value: -1 }
    ]

    const finalOutcome = cardDefinitions.reduce((currentStatus, cardType) => {
        let { totalScore, remainingSelections } = currentStatus
        const { quantity, value } = cardType

        const selectionsFromCurrentType = Math.min(quantity, remainingSelections)

        totalScore += selectionsFromCurrentType * value
        remainingSelections -= selectionsFromCurrentType

        return { totalScore, remainingSelections }
    }, { totalScore: 0, remainingSelections: kappa })

    console.log(finalOutcome.totalScore)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'))
