function analyzeText(incomingDatum) {
    const hasLuckyDigit = !!incomingDatum.match(/7/);
    const outcomeMap = {
        true: "Yes",
        false: "No"
    };
    return outcomeMap[hasLuckyDigit];
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、analyzeTextを呼び出します）
console.log(analyzeText(require("fs").readFileSync("/dev/stdin", "utf8")));