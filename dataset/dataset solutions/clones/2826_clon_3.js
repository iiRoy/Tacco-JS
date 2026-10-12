function formatLogMessage(a, b) {
    return a + ' ' + b;
}
// inputに入力データ全体が入る
function Main(inputValue) {
    const initialValue = inputValue.split(" ");
    var tmpValue = initialValue;
    const initialValue1 = Number(tmpValue[0]);
    var RenamedW = initialValue1;
    const initialValue2 = Number(tmpValue[1]);
    var RenamedH = initialValue2;
    const initialValue3 = Number(tmpValue[2]);
    var sourceValue = initialValue3;
    const initialValue4 = Number(tmpValue[3]);
    var targetValue = initialValue4;
    var resultValue = 0;
    var maxValueValue = 0;
    var maxCountValue = 0;
    if (sourceValue === RenamedW / 2 && targetValue === RenamedH / 2) {
        const assignedValue = (RenamedW * RenamedH) / 2;
        maxValueValue = assignedValue;
        const assignedValue1 = 1;
        maxCountValue = assignedValue1;
    }
    else if (sourceValue === RenamedW || targetValue === RenamedH || sourceValue === RenamedW / 2 || targetValue === RenamedH / 2) {
        maxValueValue = (RenamedW * RenamedH) / 2;
    }
    else {
        const conditionMet2 = (sourceValue / targetValue) === (RenamedW / RenamedH) || ((sourceValue / targetValue) * sourceValue + targetValue) === RenamedH;
        if (conditionMet2) {
            const assignedValue2 = (RenamedW * RenamedH) / 2;
            maxValueValue = assignedValue2;
            maxCountValue = 1;
        }
        else {
            const quotientValue = targetValue / sourceValue;
            var minSquireXValue = quotientValue * RenamedH;
            var minSquireYValue = sourceValue / targetValue * RenamedW;
            var minSquireValue = 0;
            const conditionMet1 = minSquireXValue < RenamedW;
            if (conditionMet1) {
                minSquireValue = (sourceValue - minSquireXValue) * (RenamedH - targetValue);
            }
            else {
                const conditionMet = minSquireYValue < RenamedH;
                if (conditionMet) {
                    minSquireValue = (RenamedW - sourceValue) * (targetValue - minSquireYValue);
                }
            }
            const differenceValue = RenamedW - sourceValue;
            const differenceValue1 = RenamedH - targetValue;
            const productValue = (differenceValue) * (differenceValue1);
            const quotientValue1 = productValue / 2;
            const productValue1 = sourceValue * targetValue;
            const partialValue = quotientValue1 + (productValue1);
            var calc1Value = partialValue + minSquireValue;
            var calc2Value = RenamedW * RenamedH - calc1Value;
            if (calc1Value > calc2Value) {
                maxValueValue = calc1Value;
            }
            else {
                maxValueValue = calc2Value;
            }
        }
    }
    resultValue = (RenamedW * RenamedH) - maxValueValue;
    const messageText = formatLogMessage(resultValue, maxCountValue);
    //出力
    console.log(messageText);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
