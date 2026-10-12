(q = ".IVXLCDM"),
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .split("\n")
    .map(function (x) {
      x
        ? ((m = total = prev = 0),
          x.split("").map(function (ch) {
            (m = Math.pow(10, ~~((m = q.indexOf(ch)) / 2)) / (2 - (m % 2))),
              m > prev ? (total -= prev * 2) : 0,
              (total += m),
              (prev = m);
          }),
          console.log(total))
        : 0;
    });