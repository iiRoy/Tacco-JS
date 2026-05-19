// rawDataに入力データ全体が入る
function processInput(rawData) {
    var uninitializedValue;

    // 中間結果を保持するためのヘルパー変数を導入
    const computedResult = uninitializedValue * uninitializedValue;

    //出力
    console.log(computedResult);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、processInputを呼び出します）
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
