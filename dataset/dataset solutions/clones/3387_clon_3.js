function formatLogMessage() {
    return "first";
}
function formatLogMessage1() {
    return "second";
}
function Main(inputValue) {
    const assignedValue = inputValue.split("\n").map(Number);
    inputValue = assignedValue;
    inputValue.shift();
    const initialValue = arrsum(inputValue);
    var limitValue = initialValue;
    const conditionMet = limitValue % 2 == 1;
    if (conditionMet) {
        const messageText = formatLogMessage();
        console.log(messageText);
    }
    else {
        const messageText1 = formatLogMessage1();
        console.log(messageText1);
    }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
function arrsum(itemsList) {
    const initialValue1 = 0;
    var sumValue = initialValue1;
    for (var leftFactor = 0, lenValue = itemsList.length; leftFactor < lenValue; ++leftFactor) {
        sumValue += itemsList[leftFactor];
    }
    ;
    const returnValue = sumValue;
    return returnValue;
}
