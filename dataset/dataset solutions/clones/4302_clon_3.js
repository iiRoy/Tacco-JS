function formatLogMessage(a) {
    return a;
}
// inputに入力データ全体が入る
function Main(inputValue) {
    const initialValue = inputValue[0].split(" ")[0] - 0;
    var RenamedN = initialValue;
    const initialValue1 = inputValue[0].split(" ")[1] - 0;
    var RenamedM = initialValue1;
    var listValue = {};
    var leftFactor = 1;
    while (leftFactor <= RenamedM) {
        const initialValue2 = inputValue[leftFactor].split(" ")[0] - 0;
        var firstValue = initialValue2;
        const initialValue3 = inputValue[leftFactor].split(" ")[1] - 0;
        var secondValue = initialValue3;
        listValue[firstValue] = listValue[firstValue] || {};
        listValue[secondValue] = listValue[secondValue] || {};
        listValue[firstValue][secondValue] = leftFactor;
        listValue[secondValue][firstValue] = leftFactor;
        leftFactor++;
    }
    const initialValue4 = 0;
    var ansValue = initialValue4;
    for (var leftFactor = 1; leftFactor <= RenamedM; leftFactor++) {
        const conditionMet = check(listValue, leftFactor) != RenamedN;
        if (conditionMet)
            ansValue++;
    }
    const messageText = formatLogMessage(ansValue);
    console.log(messageText);
}
function check(listValue, leftFactor) {
    var stackValue = [1];
    var checkedValue = {};
    while (stackValue.length > 0) {
        var nowValue = stackValue.splice(0, 1)[0];
        const conditionMet1 = checkedValue[nowValue];
        if (conditionMet1)
            continue;
        checkedValue[nowValue] = true;
        var nextValue = Object.keys(listValue[nowValue]);
        nextValue.forEach(nxtValue => {
            const conditionMet2 = listValue[nowValue][nxtValue] != leftFactor;
            if (conditionMet2) {
                stackValue.push(nxtValue);
            }
        });
    }
    const returnValue = Object.keys(checkedValue).length;
    return returnValue;
}
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));
