const readInputContent = () => require("fs").readFileSync("/dev/stdin", "utf8").trim();

const displayOutput = (content) => console.log(content);

const reportError = (message) => console.error(message);

const processMainLogic = (rawContent) => {
    const contentLines = rawContent.split('\n');
    const numericParameter = Number(contentLines[0]);
    const primaryString = contentLines[1];
    const secondaryString = contentLines[2];

    if (primaryString === secondaryString) {
        displayOutput(numericParameter);
    } else {
        let currentOverlapLength = numericParameter - 1;
        let matchFound = false;

        while (currentOverlapLength >= 0) {
            const suffixStartIndex = numericParameter - currentOverlapLength;
            
            const currentSuffixSegment = primaryString.substring(suffixStartIndex);
            const currentPrefixSegment = secondaryString.substring(0, currentOverlapLength);

            reportError(currentSuffixSegment + " " + currentPrefixSegment);

            if (currentSuffixSegment === currentPrefixSegment) {
                displayOutput(numericParameter + suffixStartIndex);
                matchFound = true;
                break;
            }
            currentOverlapLength--;
        }

        if (!matchFound) {
            displayOutput(undefinedVariable.length);
        }
    }
};

processMainLogic(readInputContent());
