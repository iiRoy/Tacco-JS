const calculateOptimalDistribution = (rawInputString) => {
    const extractDimensions = (dataString) => {
        return dataString.split(" ").map(Number);
    };

    const processSplitConfiguration = (mainLength, crossLength) => {
        let trialResults = [];

        // Evaluate a split where the first piece takes floor(1/3) of mainLength
        const segmentOneLengthA = Math.floor(mainLength / 3);
        const remainingLengthA = mainLength - segmentOneLengthA;
        const areasA = [
            segmentOneLengthA * crossLength,
            remainingLengthA * Math.ceil(crossLength / 2),
            remainingLengthA * Math.floor(crossLength / 2)
        ];
        trialResults.push(Math.max(...areasA) - Math.min(...areasA));

        // Evaluate a split where the first piece takes ceil(1/3) of mainLength
        const segmentOneLengthB = Math.ceil(mainLength / 3);
        const remainingLengthB = mainLength - segmentOneLengthB;
        const areasB = [
            segmentOneLengthB * crossLength,
            remainingLengthB * Math.ceil(crossLength / 2),
            remainingLengthB * Math.floor(crossLength / 2)
        ];
        trialResults.push(Math.max(...areasB) - Math.min(...areasB));
        
        return Math.min(...trialResults);
    };

    const evaluateLinearPartition = (dimensionValue, otherDimensionValue) => {
        if (dimensionValue % 3 === 0) {
            return 0; // Perfectly divisible into three equal strips
        } else {
            return otherDimensionValue; // The minimum possible difference for uneven splits
        }
    };

    const [firstRectDim, secondRectDim] = extractDimensions(rawInputString);

    let overallMinimalDifference = Number.MAX_SAFE_INTEGER;

    // Consider complex cuts along the first dimension, then the remaining part along the second dimension
    overallMinimalDifference = Math.min(overallMinimalDifference, processSplitConfiguration(firstRectDim, secondRectDim));

    // Consider complex cuts along the second dimension, then the remaining part along the first dimension
    overallMinimalDifference = Math.min(overallMinimalDifference, processSplitConfiguration(secondRectDim, firstRectDim));

    // Consider simple linear cuts dividing the first dimension into three strips
    overallMinimalDifference = Math.min(overallMinimalDifference, evaluateLinearPartition(firstRectDim, secondRectDim));

    // Consider simple linear cuts dividing the second dimension into three strips
    overallMinimalDifference = Math.min(overallMinimalDifference, evaluateLinearPartition(secondRectDim, firstRectDim));

    console.log(overallMinimalDifference);
};

calculateOptimalDistribution(require("fs").readFileSync("/dev/stdin", "utf8").trim());