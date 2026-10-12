function formatLogMessage(a) {
    return a;
}
function MainA(inputValue) {
    const initialValue = Number(inputValue);
    let numValue = initialValue;
    const initialValue1 = "";
    let answerValue = initialValue1;
    const initialValue2 = "ACL";
    const RenamedACL = initialValue2;
    for (let leftFactor = 0; leftFactor < numValue; leftFactor++) {
        answerValue += RenamedACL;
    }
    const messageText = formatLogMessage(answerValue);
    console.log(messageText);
}
MainA(require("fs").readFileSync("/dev/stdin", "utf8").trim());
