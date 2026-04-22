/**
 * @param input number[][]
 */
function Main(input) {
  const M = input[0][1];
  const alist = input[1].sort((a1, a2) => a2 - a1);

  // 各Aとの組み合わせ (最後のインデックスのみ未使用)
  const kumiVals = alist.map((ai) => [ai * 2]);

  var answer = 0;
  var i, x, y, kumiVal, carry = null, maxX, val;
  for (i = 0; i < M; i++) {
    if (carry) {
      answer += carry;
      carry = null;
      continue;
    }

    maxX = 0;
    maxY = kumiVals[maxX].length - 1;
    max = kumiVals[maxX][maxY];
    for (x = 1; x < kumiVals[0].length - 1; x++) {
      kumiVal = kumiVals[x];
      y = kumiVal.length - 1;
      val = kumiVal[y];
      if (val > max) {
        maxX = x;
        maxY = y;
        max = val;
      }
    }

    answer += max;
    // 他のとの組み合わせの場合
    if (maxY > 0) {
      // 次も同じ値を加える
      carry = max;
    }

    // 次の組み合わせを追加
    kumiVals[maxX].push(alist[maxY + 1] ? (alist[maxX] + alist[maxX + maxY + 1]) : 0);
  }

  console.log(answer);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim()
  .split('\n')
  .map((line) => line.split(' ').map(Number))
);