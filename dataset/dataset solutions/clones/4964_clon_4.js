'use strict';

const deriveScaledPosition = (actualCoord, overallDimension, segmentParity) => {
    if (overallDimension === 2) {
        return actualCoord;
    } else {
        return segmentParity === 'even' ? (actualCoord / 2) - 1 : Math.floor(actualCoord / 2);
    }
};

class ProgressionSegment {
    constructor(identificationKey, totalGridDimension, segmentParityType) {
        this.key = identificationKey;
        this.dimensionExtent = totalGridDimension;
        this.typeParity = segmentParityType;
        this.recordedObservations = [];
        this.uniformGradient = null;
    }

    assimilateObservation(position, measure) {
        this.recordedObservations.push({ position, measure });
        this.recordedObservations.sort((a, b) => a.position - b.position);

        if (this.recordedObservations.length < 2) {
            return true;
        }

        const referenceObservation = this.recordedObservations[0];
        const referenceScaledPosition = deriveScaledPosition(referenceObservation.position, this.dimensionExtent, this.typeParity);
        
        let candidateGradient = null;

        for (let i = 1; i < this.recordedObservations.length; i++) {
            const currentObservation = this.recordedObservations[i];
            const currentScaledPosition = deriveScaledPosition(currentObservation.position, this.dimensionExtent, this.typeParity);

            if (currentScaledPosition === referenceScaledPosition) {
                if (currentObservation.measure !== referenceObservation.measure) {
                    return false;
                }
                continue;
            }

            const calculatedGradient = (currentObservation.measure - referenceObservation.measure) / (currentScaledPosition - referenceScaledPosition);

            if (Math.round(calculatedGradient) !== calculatedGradient) {
                return false;
            }

            if (candidateGradient === null) {
                candidateGradient = calculatedGradient;
            } else if (candidateGradient !== calculatedGradient) {
                return false;
            }
        }

        if (this.uniformGradient === null) {
            this.uniformGradient = candidateGradient;
        } else if (candidateGradient !== null && this.uniformGradient !== candidateGradient) {
            return false;
        }
        
        return true;
    }

    checkExtremityValues() {
        if (this.uniformGradient === null) {
            return true;
        }

        const referenceObservation = this.recordedObservations[0];
        const referenceScaledPosition = deriveScaledPosition(referenceObservation.position, this.dimensionExtent, this.typeParity);

        const valueAtZeroScaledPosition = referenceObservation.measure - this.uniformGradient * referenceScaledPosition;
        if (valueAtZeroScaledPosition < 0) {
            return false;
        }

        const maximumActualPosition = this.dimensionExtent;
        const maximumScaledPosition = deriveScaledPosition(maximumActualPosition, this.dimensionExtent, this.typeParity);
        
        const valueAtMaximumScaledPosition = valueAtZeroScaledPosition + this.uniformGradient * maximumScaledPosition;
        if (valueAtMaximumScaledPosition < 0) {
            return false;
        }

        return true;
    }
}

const performGridAnalysis = (payloadLines) => {
    const gridConfiguration = payloadLines[0].split(' ').map(Number);
    const totalRows = gridConfiguration[0];
    const totalColumns = gridConfiguration[1];
    const totalObservationCount = parseInt(payloadLines[1]);
    const observationDetails = payloadLines.slice(2);

    const segmentRegistry = new Map();

    const acquireOrCreateSegment = (axisIdentifier, fixedCoordinate, overallDimension, variableCoordParity) => {
        let segmentParityMode;
        if (overallDimension === 2) {
            segmentParityMode = 'even';
        } else {
            segmentParityMode = variableCoordParity;
        }
        const segmentKey = `${axisIdentifier}-${fixedCoordinate}-${segmentParityMode}`;
        if (!segmentRegistry.has(segmentKey)) {
            segmentRegistry.set(segmentKey, new ProgressionSegment(segmentKey, overallDimension, segmentParityMode));
        }
        return segmentRegistry.get(segmentKey);
    };

    for (let currentObservationIndex = 0; currentObservationIndex < totalObservationCount; currentObservationIndex++) {
        const currentObservationData = observationDetails[currentObservationIndex].split(' ').map(Number);
        const observedRow = currentObservationData[0];
        const observedCol = currentObservationData[1];
        const observedValue = currentObservationData[2];

        const columnParity = (observedCol % 2 === 0) ? 'even' : 'odd';
        const rowProgressionSegment = acquireOrCreateSegment('ROW', observedRow, totalColumns, columnParity);
        if (!rowProgressionSegment.assimilateObservation(observedCol, observedValue) || !rowProgressionSegment.checkExtremityValues()) {
            return 'No';
        }

        const rowParity = (observedRow % 2 === 0) ? 'even' : 'odd';
        const colProgressionSegment = acquireOrCreateSegment('COLUMN', observedCol, totalRows, rowParity);
        if (!colProgressionSegment.assimilateObservation(observedRow, observedValue) || !colProgressionSegment.checkExtremityValues()) {
            return 'No';
        }
    }
    
    for (const segment of segmentRegistry.values()) {
        if (!segment.checkExtremityValues()) {
            return 'No';
        }
    }

    return 'Yes';
};

(() => {
    const inputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
    console.log(performGridAnalysis(inputData));
})();