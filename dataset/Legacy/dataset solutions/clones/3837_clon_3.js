function processInputData(rawData) {
    const lines = rawData.split("\n");
    const initialStringLine = lines[0];
    const kValueLine = lines[1];

    const processedText = initialStringLine.toLowerCase();
    const textLength = processedText.length;
    const targetK = parseInt(kValueLine, 10);

    const isLengthWithinBounds = (len) => len >= 1 && len <= 5000;
    const isKValueWithinBounds = (val) => val >= 1 && val <= 5;

    if (!isLengthWithinBounds(textLength)) {
        return;
    }
    if (!isKValueWithinBounds(targetK)) {
        return;
    }

    const collectedItems = [];
    let currentFragment = '';

    for (let outerLoopIndex = 0; outerLoopIndex <= textLength; outerLoopIndex++) {
        for (let innerLoopIndex = outerLoopIndex; innerLoopIndex <= textLength; innerLoopIndex++) {
            currentFragment = processedText.substring(outerLoopIndex, innerLoopIndex);

            if (currentFragment.length > 0) {
                const firstCharacterCode = currentFragment.charCodeAt(0);
            }
        }
    }

    collectedItems.sort();

    console.log("%s", collectedItems[targetK - 1]);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
