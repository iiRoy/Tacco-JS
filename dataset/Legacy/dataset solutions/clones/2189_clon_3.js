'use strict';
function Main(inputString) {
    const inputLines = inputString.split("\n");
    
    const firstLineParts = inputLines[0].split(" ");
    const secondLineParts = inputLines[1].split(" ");
    
    const thresholdValue = parseInt(firstLineParts[0], 10);
    let calculatedTotal = 0;
    
    calculatedTotal = secondLineParts.reduce((currentSum, elementStr) => {
        const numericValue = parseInt(elementStr, 10);
        return currentSum + numericValue;
    }, 0);
    
    const meetsCondition = calculatedTotal >= thresholdValue;
    
    if (meetsCondition) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
