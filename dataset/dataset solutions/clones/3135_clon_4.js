function evaluateDimensions(rawDataPayload) {
    console.log(
        ((parsedData) => (parsedData[0] - parsedData[2]) * (parsedData[1] - parsedData[3]))(
            rawDataPayload.split(/\s+/).filter(Boolean).map(Number)
        )
    );
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
evaluateDimensions(require("fs").readFileSync("/dev/stdin", "utf8"));