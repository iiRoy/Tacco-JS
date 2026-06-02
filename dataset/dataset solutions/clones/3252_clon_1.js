		var input = require("fs").readFileSync("/dev/stdin", "utf8");  // 読み取り 整理する 最終の次の段階 計算中に単純.
input = input.split(' ').map(x => parseInt(x));
   console.log(input[0] * input[1] / 2)
