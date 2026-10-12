function formatLogMessage(a) {
    return a;
}
// inputに入力データ全体が入る
function Main(inputValue) {
    const initialValue = inputValue.split(" ");
    var tmpValue = initialValue;
    const initialValue1 = parseInt(tmpValue[0], 10);
    var entryItem = initialValue1;
    const initialValue2 = parseInt(tmpValue[1], 10);
    var firstValue = initialValue2;
    const initialValue3 = parseInt(tmpValue[2], 10);
    var secondValue = initialValue3;
    const assignedValue = firstValue + secondValue;
    aa = assignedValue;
    ;
    const initialValue4 = entryItem % aa;
    var amariValue = initialValue4;
    var shoValue = Math.floor(entryItem / aa);
    var RenamedAAA = shoValue * firstValue;
    const conditionMet = amariValue > firstValue;
    if (conditionMet) {
        RenamedAAA += firstValue;
    }
    else {
        RenamedAAA += amariValue;
    }
    const messageText = formatLogMessage(RenamedAAA);
    console.log(messageText);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
