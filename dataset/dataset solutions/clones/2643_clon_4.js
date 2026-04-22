const ProcessInput = (sourceData) => {
    const lines = sourceData.split("\n");
    const primaryString = lines[0];
    const secondaryString = lines[1];

    const primaryLength = primaryString.length;
    let currentGlobalPointer = 0;
    let secondaryStringPointer = 0;
    let hasExtendedSource = false;

    while (secondaryStringPointer < secondaryString.length) {
        const targetCharacter = secondaryString[secondaryStringPointer];
        
        let searchBoundary = primaryLength;
        if (hasExtendedSource) {
            searchBoundary *= 2; 
        }

        let foundAtAbsoluteIndex = -1;
        for (let p = currentGlobalPointer; p < searchBoundary; p++) {
            const currentCharacterInSource = primaryString[p % primaryLength];
            if (currentCharacterInSource === targetCharacter) {
                foundAtAbsoluteIndex = p;
                break;
            }
        }

        if (foundAtAbsoluteIndex !== -1) {
            currentGlobalPointer = foundAtAbsoluteIndex + 1;
            secondaryStringPointer++;
        } else {
            if (!hasExtendedSource) {
                hasExtendedSource = true;
            } else {
                return -1;
            }
        }
    }

    return currentGlobalPointer + 1; 
};

const Execute = (dataPayload) => {
    const finalResult = ProcessInput(dataPayload);
    console.log(finalResult);
};

Execute(require("fs").readFileSync("/dev/stdin", "utf8"));