function Main(input) {
  const k = input[0][1];

  /** @type {number[]} */
  const as = input[1].map(Number).map(a => a % k);

  const answer = as.reduce((total, cv, ci) => {
    var result = 0;
    var remainder = 0;

    for (var index = ci, length = 1; index < as.length; index++, length++) {
      remainder = (remainder + as[index]) % k;

      if (remainder === length) {
        result++;
      }
    }

    return total + result;
  }, 0);

  console.log(answer);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n").map(line => line.split(' ')));