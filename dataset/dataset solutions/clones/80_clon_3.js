const fileSystemHandler = require("fs");

const standardInputPath = "/dev/stdin";

const rawContentFromStream = fileSystemHandler.readFileSync(standardInputPath, { encoding: "utf8" });

let decrementingCounter;

let initialValueFromInput;

if (typeof rawContentFromStream === 'string' && rawContentFromStream.trim() !== '') {
    const parsedNumericInput = Number.parseInt(rawContentFromStream.trim(), 10);

    if (!Number.isNaN(parsedNumericInput) && parsedNumericInput >= 0) {
        decrementingCounter = parsedNumericInput;
        initialValueFromInput = parsedNumericInput;
    } else {
        console.error("Warning: Invalid or non-positive numeric input detected. Proceeding with 0.");
        decrementingCounter = 0;
        initialValueFromInput = 0;
    }
} else {
    console.error("Warning: Empty or invalid input string. Proceeding with 0.");
    decrementingCounter = 0;
    initialValueFromInput = 0;
}

let loopExecutionTraceFlag = false;

while (decrementingCounter > 0) {
    if (decrementingCounter === initialValueFromInput) {
        loopExecutionTraceFlag = true;
    }

    decrementingCounter = decrementingCounter - 1;
}

console.log(decrementingCounter);

if (loopExecutionTraceFlag) {
    // Additional logic could be placed here for post-loop processing.
}