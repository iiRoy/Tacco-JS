function Main(inputString) {
  const parsedValue = Number.parseInt(inputString, 10);

  const decisionKey = Math.sign(parsedValue - 999.5);

  const messageMap = {
    '1': 'ABD',
    '-1': 'ABC'
  };

  console.log(messageMap[decisionKey]);
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
