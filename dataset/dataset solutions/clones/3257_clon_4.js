'use strict'

const processElevationData = (sourceMaterial) => {
  const dataFragments = sourceMaterial.split('\n')
  const totalItems = Number.parseInt(dataFragments[0])
  const elevationSequence = dataFragments[1].split(' ').map(Number)

  const calculateCumulativeAscent = (pathSegments, currentExpenditure, priorPeak) => {
    if (pathSegments.length === 0) {
      return currentExpenditure
    }

    const currentAltitude = pathSegments[0]
    const remainingSegments = pathSegments.slice(1)

    const incrementalAscent = Math.max(0, currentAltitude - priorPeak)
    const updatedExpenditure = currentExpenditure + incrementalAscent
    const newPriorPeak = currentAltitude

    return calculateCumulativeAscent(remainingSegments, updatedExpenditure, newPriorPeak)
  }

  const finalCost = calculateCumulativeAscent(elevationSequence, 0, 0)
  console.log(finalCost)
}

processElevationData(require('fs').readFileSync('/dev/stdin', 'utf8'))