function f(i, x, n, acc) {
  if (x > n) return acc;
  var p = new Array(10);
  var m = x;
  while (m > 0) {
    switch(m % 10) {
      case 3: {
        p[3] = true;
        break;
      }
      case 5: {
        p[5] = true;
        break;
      }
      case 7: {
        p[7] = true;
        break;
      }
      default: {
        break;
      }
    }
    m = Math.floor(m / 10);
  }
  acc += p[3] === true && p[5] === true && p[7] === true ? 1 : 0;
  acc += f(i + 1, Math.pow(10, i) * 3 + x, n, 0);
  acc += f(i + 1, Math.pow(10, i) * 5 + x, n, 0);
  acc += f(i + 1, Math.pow(10, i) * 7 + x, n, 0);
  return acc;
}

function Main(input) {
  var n = parseInt(input);
  var acc = 0;
  acc += f(1, 3, n, 0);
  acc += f(1, 5, n, 0);
  acc += f(1, 7, n, 0);
  console.log(acc);
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
