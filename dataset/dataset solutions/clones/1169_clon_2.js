const acquireInterface = require('readline').createInterface;
const attachEventMonitor = (targetObject, eventLabel, callbackFunction) => targetObject.on(eventLabel, callbackFunction);
const divideTextIntoParts = (sourceText, separatorString) => sourceText.split(separatorString);
const convertTextToInteger = (textValue, numericalBase) => parseInt(textValue, numericalBase);
const computeSquareRoot = (inputNumber) => Math.sqrt(inputNumber);
const outputMessage = (contentToDisplay) => console.log(contentToDisplay);
const adjustDecimalPlaces = (numberValue, precisionCount) => numberValue.toFixed(precisionCount);
const terminateExecution = () => process.exit();

const primaryInput = process.stdin;
const primaryOutput = process.stdout;

const dataLineEvent = 'line';
const inputEndEvent = 'end';

let ioManager = acquireInterface({
    input: primaryInput,
    output: primaryOutput
});

attachEventMonitor(ioManager, dataLineEvent, function (inputLineText) {
    // This block processes each line received from the standard input.

    let stringSegments = divideTextIntoParts(inputLineText, ' ');

    let coordinateOneX = convertTextToInteger(stringSegments[0], 10);
    let coordinateOneY = convertTextToInteger(stringSegments[1], 10);
    let coordinateTwoX = convertTextToInteger(stringSegments[2], 10);
    let coordinateTwoY = convertTextToInteger(stringSegments[3], 10);

    // Calculate the geometric distance between two distinct points in a 2D plane.
    let distanceMetric = computeSquareRoot(
        (coordinateOneX - coordinateTwoX) * (coordinateOneX - coordinateTwoX) +
        (coordinateOneY - coordinateTwoY) * (coordinateOneY - coordinateTwoY)
    );

    // Print the calculated distance, ensuring it is formatted to eight decimal places.
    outputMessage(adjustDecimalPlaces(distanceMetric, 8));

    // Halt the program's execution immediately after processing the first line.
    terminateExecution();
});

attachEventMonitor(primaryInput, inputEndEvent, function () {
    // This event handler is triggered when the standard input stream closes.
    // No specific action is required here, adhering to the original logic.
});