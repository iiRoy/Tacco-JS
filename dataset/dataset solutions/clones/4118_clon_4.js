function evaluateSequence(incomingData) {
    const dataLines = incomingData.split("\n");

    const dimensions = dataLines[0].split(" ");
    const firstCount = Number(dimensions[0]);
    const secondCount = Number(dimensions[1]);

    const targetString = dataLines[1];

    const requiredLength = firstCount + 1 + secondCount;

    if (targetString.length !== requiredLength) {
        console.log("No");
        return;
    }

    if (targetString.charAt(firstCount) !== '-') {
        console.log("No");
        return;
    }

    const firstPortion = targetString.slice(0, firstCount);
    const secondPortion = targetString.slice(firstCount + 1);

    const checkNumeric = (segment) => {
        for (let idx = 0; idx < segment.length; idx++) {
            const charValue = segment.charCodeAt(idx);
            if (!(charValue >= 48 && charValue <= 57)) { // ASCII '0' is 48, '9' is 57
                return false;
            }
        }
        return true;
    };

    if (checkNumeric(firstPortion) && checkNumeric(secondPortion)) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

const fileAccessModule = require("fs");
const rawInputContent = fileAccessModule.readFileSync("/dev/stdin", "utf8");
const processedInput = rawInputContent.trim();

evaluateSequence(processedInput);