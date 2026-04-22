const createColumnTitles = (sources) => {
    return ['Timestamp'].concat(sources.map(s => s.label));
};

exports.processEventData = (eventSources) => {
    const combinedDataPoints = eventSources.flatMap((sourceUnit, sourceIndex) =>
        sourceUnit.data.map(datumItem => ({
            moment: datumItem.time,
            scalar: datumItem.length,
            origin: sourceIndex
        }))
    );

    const topMoment = combinedDataPoints.reduce((accumulator, currentPoint) =>
        Math.max(accumulator, currentPoint.moment), 0
    );
    const topScalar = combinedDataPoints.reduce((accumulator, currentPoint) =>
        Math.max(accumulator, currentPoint.scalar), 0
    );

    const dataGridRows = combinedDataPoints.map(dataPointEntry => {
        const seriesScalars = Array.from({ length: eventSources.length }, (_, seriesIdx) =>
            seriesIdx === dataPointEntry.origin ? dataPointEntry.scalar : null
        );
        return [dataPointEntry.moment, ...seriesScalars];
    });

    const fullGrid = [createColumnTitles(eventSources), ...dataGridRows];

    return {
        chartData: fullGrid,
        peakMoment: topMoment,
        peakScalar: topScalar
    };
};