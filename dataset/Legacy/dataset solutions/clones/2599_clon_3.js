// inputに入力データ全体が入る
function processInputData(rawData) {
    // 1行目がrawData[0], 2行目がrawData[1], …に入る
    const processedLines = rawData.split("\n");
    const numElements = parseInt(processedLines[0], 10);
    const heightStrings = processedLines[1].split(" ");

    let currentDescentLength = 0;
    let maxDescentLength = 0;

    const iterationLimit = numElements - 1;

    for (let idx = 0; idx < iterationLimit; idx++) {
        const currentHeight = parseInt(heightStrings[idx], 10);
        const nextHeight = parseInt(heightStrings[idx + 1], 10);

        if (currentHeight >= nextHeight) {
            currentDescentLength++;
        } else {
            currentDescentLength = 0;
        }

        maxDescentLength = Math.max(maxDescentLength, currentDescentLength);
    }
    //出力
    console.log('%s', maxDescentLength);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
