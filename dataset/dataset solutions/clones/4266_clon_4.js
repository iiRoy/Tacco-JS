function ProcessData(incomingData) {
    const obtainNumericSequence = (lineText) => {
        const segments = lineText.split(' ');
        const numericalElements = [];
        for (let j = 0; j < segments.length; j++) {
            numericalElements.push(parseInt(segments[j], 10));
        }
        return numericalElements;
    };

    const textLines = incomingData.split('\n');
    const collectionAlpha = obtainNumericSequence(textLines[1]);
    const collectionBeta = obtainNumericSequence(textLines[2]);
    const collectionGamma = obtainNumericSequence(textLines[3]);

    const preliminaryCounts = [];
    for (let j = 0; j < collectionBeta.length; j++) {
        const currentBetaElement = collectionBeta[j];
        let countOfSmallerAlphas = 0;
        for (let k = 0; k < collectionAlpha.length; k++) {
            if (collectionAlpha[k] < currentBetaElement) {
                countOfSmallerAlphas++;
            }
        }
        preliminaryCounts.push(countOfSmallerAlphas);
    }

    console.log(preliminaryCounts);

    let overallAccumulation = 0;

    for (let j = 0; j < collectionBeta.length; j++) {
        const currentBetaElement = collectionBeta[j];
        const correspondingPreliminaryCount = preliminaryCounts[j];

        let countOfGammaElementsGreaterThanBeta = 0;
        for (let k = 0; k < collectionGamma.length; k++) {
            if (currentBetaElement < collectionGamma[k]) {
                countOfGammaElementsGreaterThanBeta++;
            }
        }
        overallAccumulation += correspondingPreliminaryCount * countOfGammaElementsGreaterThanBeta;
    }

    console.log(overallAccumulation);
}

ProcessData(require('fs').readFileSync('/dev/stdin', 'utf8'));