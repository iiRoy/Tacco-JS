function processInputData(rawDataString) {
    const cleanedInputString = rawDataString.trim();
    const inputLines = cleanedInputString.split("\n");
    const processedLines = inputLines.map(function(lineContent) {
        return lineContent.split(" ");
    });
    return processedLines;
}

function createAndInitializeDpArray(size, initialValue) {
    const newArray = new Array(size);
    for (let idx = 0; idx < size; idx++) {
        newArray[idx] = initialValue;
    }
    return newArray;
}

function calculateMinCoinCounts(inputString) {
    const processedInput = processInputData(inputString);

    const setAValues = [1,4,10,20,35,56,84,120,165,220,286,364,455,560,680,816,969,1140,1330,1540,1771,2024,2300,2600,2925,3276,3654,4060,4495,4960,5456,5984,6545,7140,7770,8436,9139,9880,10660,11480,12341,13244,14190,15180,16215,17296,18424,19600,20825,22100,23426,24804,26235,27720,29260,30856,32509,34220,35990,37820,39711,41664,43680,45760,47905,50116,52394,54740,57155,59640,62196,64824,67525,70300,73150,76076,79079,82160,85320,88560,91881,95284,98770,102340,105995,109736,113564,117480,121485,125580,129766,134044,138415,142880,147440,152096,156849,161700,166650,171700,176851,182104,187460,192920,198485,204156,209934,215820,221815,227920,234136,240464,246905,253460,260130,266916,273819,280840,287980,295240,302621,310124,317750,325500,333375,341376,349504,357760,366145,374660,383306,392084,400995,410040,419220,428536,437989,447580,457310,467180,477191,487344,497640,508080,518665,529396,540274,551300,562475,573800,585276,596904,608685,620620,632710,644956,657359,669920,682640,695520,708561,721764,735130,748660,762355,776216,790244,804440,818805,833340,848046,862924,877975,893200,908600,924176,939929,955860,971970,988260];
    const setBValues = [1,35,165,455,969,1771,2925,4495,6545,9139,12341,16215,20825,26235,32509,39711,47905,57155,67525,79079,91881,105995,121485,138415,156849,176851,198485,221815,246905,273819,302621,333375,366145,400995,437989,477191,518665,562475,608685,657359,708561,762355,818805,877975,939929];

    const MAX_CALC_LIMIT = 1000000;
    const INITIAL_DP_STATE = Infinity;

    let minCountA = createAndInitializeDpArray(MAX_CALC_LIMIT, INITIAL_DP_STATE);
    let minCountB = createAndInitializeDpArray(MAX_CALC_LIMIT, INITIAL_DP_STATE);

    minCountA[0] = 0;
    minCountB[0] = 0;

    for (let currentSumTarget = 0; currentSumTarget < MAX_CALC_LIMIT; currentSumTarget++) {
        for (let elementIdxA = 0; elementIdxA < setAValues.length; elementIdxA++) {
            const currentCoinValueA = setAValues[elementIdxA];
            const previousSumRequiredA = currentSumTarget - currentCoinValueA;

            if (previousSumRequiredA >= 0) {
                minCountA[currentSumTarget] = Math.min(
                    minCountA[currentSumTarget],
                    minCountA[previousSumRequiredA] + 1
                );
            }
        }

        for (let elementIdxB = 0; elementIdxB < setBValues.length; elementIdxB++) {
            const currentCoinValueB = setBValues[elementIdxB];
            const previousSumRequiredB = currentSumTarget - currentCoinValueB;

            if (previousSumRequiredB >= 0) {
                minCountB[currentSumTarget] = Math.min(
                    minCountB[currentSumTarget],
                    minCountB[previousSumRequiredB] + 1
                );
            }
        }
    }

    const TERMINATION_INPUT_VALUE = '0';

    while (true) {
        const currentInputLineArray = processedInput.shift();

        if (!currentInputLineArray || currentInputLineArray.length === 0) {
            break;
        }

        const numericStringValue = currentInputLineArray[0];

        if (numericStringValue === TERMINATION_INPUT_VALUE) {
            break;
        }

        const resultForA = minCountA[numericStringValue];
        const resultForB = minCountB[numericStringValue];

        console.log(`${resultForA} ${resultForB}`);
    }
}

calculateMinCoinCounts(require("fs").readFileSync("/dev/stdin", "utf8"));
