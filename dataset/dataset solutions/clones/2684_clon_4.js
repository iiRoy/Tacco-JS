function processSegments(receivedText) {
    const dataLines = receivedText.split("\n");
    const countQuantity = Number(dataLines[0]);
    const seriesElements = dataLines[1].split(" ").map(Number);

    const initialBase = seriesElements[countQuantity - 1];
    const precedingElements = seriesElements.slice(0, countQuantity - 1);

    const validityCheck = precedingElements.reduceRight((currentStatus, currentMeasure) => {
        if (!currentStatus.isAcceptable) {
            return currentStatus;
        }

        let effectiveMeasure = currentMeasure;
        const rightwardMeasure = currentStatus.comparisonBase;

        if (effectiveMeasure - rightwardMeasure > 1) {
            return { isAcceptable: false, comparisonBase: rightwardMeasure };
        } else if (effectiveMeasure - rightwardMeasure === 1) {
            effectiveMeasure--;
        }
        
        return { isAcceptable: true, comparisonBase: effectiveMeasure };
    }, { isAcceptable: true, comparisonBase: initialBase });

    const finalAssessment = validityCheck.isAcceptable ? 'Yes' : 'No';
    console.log(finalAssessment);
}