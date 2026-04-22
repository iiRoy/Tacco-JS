const processInputData = (incomingData) => {
    const cleansedText = incomingData.trim();

    const calculateResult = (position, priorChunk, currentAccumulation, finalCount) => {
        if (position >= cleansedText.length) {
            return finalCount;
        }

        const currentCharacter = cleansedText[position];
        const updatedAccumulation = currentAccumulation + currentCharacter;

        if (updatedAccumulation === priorChunk) {
            return calculateResult(position + 1, priorChunk, updatedAccumulation, finalCount);
        } else {
            return calculateResult(position + 1, updatedAccumulation, "", finalCount + 1);
        }
    };

    const outcomeValue = calculateResult(1, "", "", 0);

    console.log(outcomeValue);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));