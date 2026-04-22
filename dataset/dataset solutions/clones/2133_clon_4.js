const processInput = (rawString) => {
  const parts = rawString.split(' ');
  const numericalValue = Number(parts[0]);
  const targetBase = Number(parts[1]);

  if (numericalValue === 0) {
    console.log(0);
    return;
  }

  const computedLength = Math.floor(Math.log(numericalValue) / Math.log(targetBase)) + 1;
  console.log(computedLength);
};
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));