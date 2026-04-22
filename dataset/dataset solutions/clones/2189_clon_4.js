'use strict';
function ProcessInformation(incomingText) {
  const textLines = incomingText.split('\n');

  const thresholdCriterion = parseInt(textLines[0], 10);

  const numericElements = textLines[1].split(' ').map(val => parseInt(val, 10));

  const cumulativeTotal = numericElements.reduce((accumulator, currentElement) => accumulator + currentElement, 0);

  const finalVerdict = (cumulativeTotal >= thresholdCriterion) ? "Yes" : "No";

  console.log(finalVerdict);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
ProcessInformation(require("fs").readFileSync("/dev/stdin", "utf8"));