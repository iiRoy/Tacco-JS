// inputに入力データ全体が入る
function processInputData(rawDataString) {
    const inputLines = rawDataString.split("\n");
    const firstLineSegments = inputLines[0].split(" ");

    const totalCount = parseInt(firstLineSegments[0], 10);
    const removalCount = parseInt(firstLineSegments[1], 10);

    const specialCaseOutput = 0;

    if (totalCount === 1) {
        console.log(specialCaseOutput);
        return;
    }

    const calculatedDifference = totalCount - removalCount;
    console.log(calculatedDifference);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
