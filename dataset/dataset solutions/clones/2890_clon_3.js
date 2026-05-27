// inputに入力データ全体が入る
function Main(rawInputData) {
    const LINE_SEPARATOR = "\n";
    const TARGET_CHAR_TO_REMOVE = "o";
    const MIN_REQUIRED_LENGTH = 8;

    const inputLines = rawInputData.split(LINE_SEPARATOR);
    let processedStringSegment = inputLines[0];

    processedStringSegment = processedStringSegment.split(TARGET_CHAR_TO_REMOVE).join('');

    const finalSegmentLength = processedStringSegment.length;

    if (finalSegmentLength >= MIN_REQUIRED_LENGTH) {
        console.log("NO");
    } else {
        console.log("YES");
    }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
