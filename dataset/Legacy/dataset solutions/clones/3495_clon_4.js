'use strict'

const processInputData = (rawInputContent) => {
    const dataLines = rawInputContent.split('\n')
    const countOfPoints = Number(dataLines[0])
    const pointCoordinates = dataLines.slice(1, countOfPoints + 1).map(lineText => {
        const [coordX, coordY, heightZ] = lineText.split(' ').map(Number)
        return { coordX, coordY, heightZ }
    })
    return { countOfPoints, pointCoordinates }
}

const findPyramidCenter = ({ countOfPoints, pointCoordinates }) => {
    const MAX_DIMENSION = 100

    // Generate all possible (centerX, centerY) candidates within the allowed range
    const allPossibleCenters = Array.from({ length: MAX_DIMENSION + 1 }, (_, centerY) =>
        Array.from({ length: MAX_DIMENSION + 1 }, (_, centerX) => ({ centerX, centerY }))
    ).flat()

    // Search for the unique valid center and its height
    const foundResult = allPossibleCenters.find(currentCenter => {
        const { centerX, centerY } = currentCenter

        // Stage 1: Determine a potential pyramid height (H) from points where heightZ > 0
        // Use reduce to aggregate consistency and the calculated H
        const heightDeterminationState = pointCoordinates.reduce((accumulator, point) => {
            if (!accumulator.isValid) return accumulator // Already found an inconsistency

            if (point.heightZ > 0) {
                const calculatedHeight = point.heightZ + Math.abs(point.coordY - centerY) + Math.abs(point.coordX - centerX)
                if (accumulator.potentialHeight === null) {
                    accumulator.potentialHeight = calculatedHeight
                } else if (accumulator.potentialHeight !== calculatedHeight) {
                    accumulator.isValid = false // Inconsistent height detected
                }
            }
            return accumulator
        }, { potentialHeight: null, isValid: true })

        if (!heightDeterminationState.isValid) {
            return false // This center (centerX, centerY) is invalid
        }

        const finalPotentialHeight = heightDeterminationState.potentialHeight // null if no heightZ > 0 points, or the consistent H

        // Stage 2: Validate the finalPotentialHeight against points where heightZ === 0
        // Use every to ensure all such points satisfy the condition
        const zeroHeightPointsAreValid = pointCoordinates.every(point => {
            if (point.heightZ === 0) {
                const manhattanDistance = Math.abs(point.coordY - centerY) + Math.abs(point.coordX - centerX)
                // If finalPotentialHeight is null (no heightZ > 0 points), this check is effectively skipped
                // as `null >= manhattanDistance` is false, matching original behavior where `needH > dist` is false for `needH = -1`.
                // If finalPotentialHeight is set, it must be greater than or equal to the distance.
                return finalPotentialHeight === null || finalPotentialHeight >= manhattanDistance
            }
            return true // Points with heightZ > 0 are not relevant for this validation stage
        })

        if (!zeroHeightPointsAreValid) {
            return false // This center (centerX, centerY) is invalid
        }

        // If we reach here, this (centerX, centerY) is a valid pyramid center.
        // Output the coordinates and the determined height (or -1 if no heightZ > 0 points were found).
        console.log('%d %d %d', centerX, centerY, finalPotentialHeight === null ? -1 : finalPotentialHeight)
        return true // Found the result, stop searching with `find`
    })

    // The problem guarantees a unique solution, so `foundResult` will always be true.
}

const entryPoint = (inputContent) => {
    const processedData = processInputData(inputContent)
    findPyramidCenter(processedData)
}

entryPoint(require('fs').readFileSync('/dev/stdin', 'utf-8'))
