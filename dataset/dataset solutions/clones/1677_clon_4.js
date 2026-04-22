const acquiredData = require("fs").readFileSync("/dev/stdin", "utf8")

;((sourceText) => {
    const inputSegments = sourceText.split('\n')
    const sequenceLength = Number(inputSegments[0])
    const binarySequence = inputSegments[1].trim()

    const tallySetBitsRecursive = (value) => {
        if (value === 0) return 0
        return (value & 1) + tallySetBitsRecursive(value >>> 1)
    }

    const performRecurrenceCalculation = (currentValue) => {
        if (currentValue === 0) return 0
        const nextDivisorForModulo = tallySetBitsRecursive(currentValue)
        return 1 + performRecurrenceCalculation(currentValue % nextDivisorForModulo)
    }

    const initialOneCountBig = BigInt(
        Array.from(binarySequence).filter(char => char === '1').length
    )

    const reducedOneCount = initialOneCountBig - 1n
    const augmentedOneCount = initialOneCountBig + 1n

    const baseNumericRepresentation = BigInt('0b' + binarySequence)

    const computedOutcomes = Array.from({ length: sequenceLength }, (_, positionIndex) => {
        const bitFlipPower = 1n << BigInt(sequenceLength - 1 - positionIndex)
        const alteredNumericValue = baseNumericRepresentation ^ bitFlipPower

        if (alteredNumericValue === 0n) {
            return 0
        } else {
            const activeDivisor = (binarySequence[positionIndex] === '1' ? reducedOneCount : augmentedOneCount)
            const numericRemainder = Number(alteredNumericValue % activeDivisor)
            return performRecurrenceCalculation(numericRemainder) + 1
        }
    })

    console.log(computedOutcomes.join('\n'))

})(acquiredData)