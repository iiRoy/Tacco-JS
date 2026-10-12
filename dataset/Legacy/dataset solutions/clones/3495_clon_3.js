'use strict'

const processInput = (rawData) => {
    const lines = rawData.split('\n')
    const pointCount = parseInt(lines[0])

    const observationPoints = lines.slice(1, pointCount + 1).map(lineStr => {
        const parsedCoords = lineStr.split(' ').map(coordStr => parseInt(coordStr))
        return {
            x: parsedCoords[0],
            y: parsedCoords[1],
            h: parsedCoords[2]
        }
    })

    const calculateManhattanDistance = (x1, y1, x2, y2) => {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2)
    }

    const gridLimit = 100
    for (let currentY = 0; currentY <= gridLimit; currentY++) {
        for (let currentX = 0; currentX <= gridLimit; currentX++) {
            let candidateHeight = -1

            for (let pointIndex = 0; pointIndex < pointCount; pointIndex++) {
                const currentPoint = observationPoints[pointIndex]
                if (currentPoint.h > 0) {
                    const distanceToCenter = calculateManhattanDistance(currentPoint.x, currentPoint.y, currentX, currentY)
                    const potentialH = currentPoint.h + distanceToCenter

                    if (candidateHeight === -1) {
                        candidateHeight = potentialH
                    } else if (candidateHeight !== potentialH) {
                        candidateHeight = -2
                        break
                    }
                }
            }

            if (candidateHeight === -2) {
                continue
            }

            for (let pointIndex = 0; pointIndex < pointCount; pointIndex++) {
                const currentPoint = observationPoints[pointIndex]
                const distanceToCenter = calculateManhattanDistance(currentPoint.x, currentPoint.y, currentX, currentY)

                if (currentPoint.h === 0) {
                    if (candidateHeight > distanceToCenter) {
                        candidateHeight = -2
                        break
                    }
                } else {
                    if (candidateHeight !== currentPoint.h + distanceToCenter) {
                        candidateHeight = -2
                        break
                    }
                }
            }

            if (candidateHeight !== -2) {
                console.log('%d %d %d', currentX, currentY, candidateHeight)
            }
        }
    }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'))
