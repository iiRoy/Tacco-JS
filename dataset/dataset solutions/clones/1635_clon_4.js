const processMeasurementData = (sourceData) => {
    const dissectPayload = (payload) => {
        const segments = payload.trim().split(/\s*\n\s*/);
        const firstLineFields = segments[0].split(/\s+/);
        const limitOnDivisions = parseInt(firstLineFields[1], 10);
        const rawMeasurements = segments[1].split(/\s+/).map(Number);
        return { limitOnDivisions, rawMeasurements };
    };

    const { limitOnDivisions, rawMeasurements } = dissectPayload(sourceData);

    const assessSubdivisions = (measurements, unitSize) =>
        measurements.reduce((totalDivs, currentMeasurement) =>
            totalDivs + (Math.ceil(currentMeasurement / unitSize) - 1), 0);

    const seekOptimalUnit = (
        items,
        allowedDivisions,
        lowExtent,
        highExtent,
        candidateOptimal
    ) => {
        if (lowExtent > highExtent) {
            return candidateOptimal;
        }

        const probeSize = Math.floor((lowExtent + highExtent) / 2);
        const actualDivisions = assessSubdivisions(items, probeSize);

        if (actualDivisions <= allowedDivisions) {
            return seekOptimalUnit(
                items,
                allowedDivisions,
                lowExtent,
                probeSize - 1,
                probeSize
            );
        } else {
            return seekOptimalUnit(
                items,
                allowedDivisions,
                probeSize + 1,
                highExtent,
                candidateOptimal
            );
        }
    };

    const maximumMeasurement = Math.max(...rawMeasurements);
    const minimumPossibleUnit = 1;
    const initialOptimalCandidate = maximumMeasurement;

    return seekOptimalUnit(
        rawMeasurements,
        limitOnDivisions,
        minimumPossibleUnit,
        maximumMeasurement,
        initialOptimalCandidate
    );
};