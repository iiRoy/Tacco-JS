const obtainPayload = () => require('node:fs').readFileSync(0, 'utf8');

const tallySphericalMarkers = (transmission) => {
    const occurrences = transmission.match(/o/g);
    return occurrences ? occurrences.length : 0;
};

const renderFinalMetric = (markerTally) => {
    const initialOffset = 700;
    const scalarFactor = 100;
    const culminatedRating = initialOffset + markerTally * scalarFactor;
    console.log(culminatedRating);
};

(function processObservation() {
    const incomingSignal = obtainPayload();
    const foundMarkers = tallySphericalMarkers(incomingSignal);
    renderFinalMetric(foundMarkers);
})();