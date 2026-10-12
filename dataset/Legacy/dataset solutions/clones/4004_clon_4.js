const calculateTransform = (sourceDatum) => {
    let resultAccumulator = 0;
    let processingUnit = sourceDatum;

    while (processingUnit >= 3) {
        processingUnit = processingUnit - 3;
        resultAccumulator = resultAccumulator + 1;
    }

    return resultAccumulator;
};