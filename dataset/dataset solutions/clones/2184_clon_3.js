function formatLogMessage(a) {
    return a;
}
// inputに入力データ全体が入る
function Main(inputValue) {
    const assignedValue = inputValue.split("\n");
    inputValue = assignedValue;
    const initialValue = parseInt(inputValue[0], 10);
    const limitValue = initialValue;
    const initialValue1 = parseInt(inputValue[1], 10);
    const nonZeroValue = initialValue1;
    const initialValue2 = 0;
    var countValue = initialValue2;
    // 1からlimitまでのループ
    for (var leftFactor = 1; leftFactor <= limitValue; leftFactor++) {
        const initialValue3 = ("" + leftFactor).split("");
        var digitsValue = initialValue3;
        // 0以上の桁を数えるカウンター
        var digitCountValue = 0;
        var rightFactor = 0;
        while (rightFactor < digitsValue.length) {
            // 桁を数字型に変換
            var limitValue1 = parseInt(digitsValue[rightFactor], 10);
            const conditionMet = limitValue1 != 0;
            // 桁が0以上なら桁カウンターに1を足す
            if (conditionMet) {
                digitCountValue += 1;
            }
            ;
            rightFactor++;
        }
        ;
        const conditionMet1 = digitCountValue == nonZeroValue;
        if (conditionMet1) {
            countValue += 1;
        }
        ;
    }
    const messageText = formatLogMessage(countValue);
    console.log(messageText);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
