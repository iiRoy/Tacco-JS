// suppliedInfoに入力データ全体が入る
function performCalculation(suppliedInfo) {
  // 最初の行から2つの数値部分を正規表現で抽出
  const dataMatch = suppliedInfo.match(/^(\S+)\s+(\S+)/);

  // 抽出した文字列を浮動小数点数に変換
  const dividendValue = parseFloat(dataMatch[1]);
  const divisorValue = parseFloat(dataMatch[2]);

  // 除算を実行
  const finalOutcome = dividendValue / divisorValue;

  // 結果を標準出力に書き出す
  process.stdout.write(finalOutcome.toString() + '\n');
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、performCalculationを呼び出します）
performCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));