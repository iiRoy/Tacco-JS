function performCheck(dataBlock) {
    const positiveOutcome = "Yes";
    const negativeOutcome = "No";
    const secretSequence = ["Y", "A", "K", "I"];

    const firstSegmentMatch = dataBlock.match(/^[^\n]*/);
    let initialLine = "";
    if (firstSegmentMatch && firstSegmentMatch[0] !== undefined) {
        initialLine = firstSegmentMatch[0];
    }

    let isMatch = true;

    if (initialLine.length < secretSequence.length) {
        isMatch = false;
    } else {
        for (let i = 0; i < secretSequence.length; i++) {
            if (initialLine.charAt(i) !== secretSequence[i]) {
                isMatch = false;
                break;
            }
        }
    }

    if (isMatch) {
        console.log(positiveOutcome);
    } else {
        console.log(negativeOutcome);
    }
}

const acquireSourceData = () => require("fs").readFileSync("/dev/stdin", "utf8");
const processSource = (source) => performCheck(source);
processSource(acquireSourceData());