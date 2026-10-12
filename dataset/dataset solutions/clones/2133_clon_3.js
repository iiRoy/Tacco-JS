function Main(inputValue) {
    const initialValue = inputValue.split(' ');
    var splitValue = initialValue;
    const initialValue1 = +splitValue[0];
    var valueValue = initialValue1;
    const initialValue2 = +splitValue[1];
    var digitValue = initialValue2;
    const initialValue3 = '';
    var resultValue = initialValue3;
    while (valueValue > 0) {
        resultValue += valueValue % digitValue;
        const assignedValue = Math.floor(valueValue / digitValue);
        valueValue = assignedValue;
    }
    console.log(resultValue.length);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
