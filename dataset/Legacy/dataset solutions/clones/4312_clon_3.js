const processInputData = (rawInputString) => {
    const NEWLINE_DELIMITER = '\n';

    const parseAndSortNumbers = (lineStr) => {
        const SPACE_DELIMITER = ' ';
        return lineStr.split(SPACE_DELIMITER).map(Number).sort((a, b) => a - b);
    };

    const inputLines = rawInputString.split(NEWLINE_DELIMITER);

    const initialCountD = parseInt(inputLines[0], 10);

    let availableItems = parseAndSortNumbers(inputLines[1]);

    const targetCount = parseInt(inputLines[2], 10);

    let requiredItems = parseAndSortNumbers(inputLines[3]);

    let matchResult = 'No';

    for (let reqIdx = 0; reqIdx < targetCount; reqIdx++) {
        const currentRequiredItem = requiredItems.shift();
        const currentAvailableLength = availableItems.length;
        let itemFoundAndRemoved = false;

        for (let availIdx = 0; availIdx < currentAvailableLength; availIdx++) {
            if (currentRequiredItem === availableItems[availIdx]) {
                availableItems = availableItems.slice(availIdx + 1);
                itemFoundAndRemoved = true;
                break;
            }
        }
    }

    const finalCheckValue = 0;
    requiredItems.push(finalCheckValue);
    const referenceArrayForCheck = [finalCheckValue];

    const isFinalMatchConditionMet = (requiredItems == referenceArrayForCheck);

    if (isFinalMatchConditionMet) {
        matchResult = 'Yes';
    }

    console.log(matchResult);
    return 0;
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
