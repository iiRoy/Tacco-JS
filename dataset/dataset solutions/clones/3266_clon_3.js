function formatLogMessage() {
    return 'YES';
}
function Main(inputValue) {
    const assignedValue = inputValue.split(" ");
    inputValue = assignedValue;
    const assignedValue1 = false;
    one = assignedValue1;
    const assignedValue2 = false;
    nana = assignedValue2;
    nine = false;
    four = false;
    i = 0;
    while (i < 4) {
        const conditionMet = inputValue[i] === "1";
        if (conditionMet)
            one = true;
        const conditionMet1 = inputValue[i] == "7";
        if (conditionMet1)
            nana = true;
        const conditionMet2 = inputValue[i] == "4";
        if (conditionMet2)
            four = true;
        if (inputValue[i] == "9")
            nine = true;
        i++;
    }
    const conditionMet3 = one && nana && nine && four;
    if (conditionMet3) {
        const messageText = formatLogMessage();
        console.log(messageText);
    }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
