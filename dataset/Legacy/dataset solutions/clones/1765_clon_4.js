const processInputData = (sourceContent) => {
    const contentLines = sourceContent.split('\n');
    const primaryValues = contentLines[0].split(' ');

    const searchRange = Array.from({ length: 5 }, (_, index) => index);

    const determinedPosition = searchRange.reduceRight((currentResult, currentElementIndex) => {
        if (currentResult !== '') {
            return currentResult;
        }
        if (primaryValues[currentElementIndex] === '0') {
            return String(currentElementIndex);
        }
        return '';
    }, '');

    console.log(Number.parseInt(determinedPosition) + 1);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
