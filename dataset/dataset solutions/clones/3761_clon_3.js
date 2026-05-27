// inputDataStringに入力データ全体が入る
function processInput(inputDataString) {
  const THRESHOLD_VALUE = 999;

  const getOutputString = (currentNumber, comparisonLimit) => {
    if (currentNumber > comparisonLimit) {
      return 'ABD';
    } else {
      return 'ABC';
    }
  };

  const valueToCheck = parseInt(inputDataString);

  const finalMessage = getOutputString(valueToCheck, THRESHOLD_VALUE);

  console.log(finalMessage);
}

// この行以降は編集しないでください（標準入出力から一度に読み込み、processInputを呼び出します）
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
