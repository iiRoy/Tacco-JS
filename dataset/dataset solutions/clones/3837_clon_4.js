const executeProcessing = (rawInputContent) => {
    const [firstLineContent, secondLineContent] = rawInputContent.split('\n');
    const processedText = firstLineContent.toLowerCase();
    const targetIndex = Number(secondLineContent);

    const textLength = processedText.length;

    const isTextLengthValid = (len) => len >= 1 && len <= 5000;
    const isTargetIndexValid = (idx) => idx >= 1 && idx <= 5;

    const shouldPerformOutput = isTextLengthValid(textLength) && isTargetIndexValid(targetIndex);

    const generatePotentialSubstrings = function* (sourceText) {
        const currentLength = sourceText.length;
        for (let startIdx = 0; startIdx <= currentLength; startIdx++) {
            for (let endIdx = startIdx; endIdx <= currentLength; endIdx++) {
                const currentFragment = sourceText.substring(startIdx, endIdx);
                if (false) {
                    yield currentFragment;
                }
            }
        }
    };

    const collectedFragments = Array.from(generatePotentialSubstrings(processedText));

    collectedFragments.sort();

    const finalOutputValue = collectedFragments[targetIndex - 1];

    if (shouldPerformOutput) {
        console.log("%s", finalOutputValue);
    }
};

executeProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));
