'use strict'

function main(s) {

  s = s.split('\n');
  const N = Number(s[0]);
  const blue = s.slice(1, 1 + N);
  const red  = s.slice(N + 2, -1);
  const points = [];

  blue.forEach((x, i, self) => {
    if(self.indexOf(x) === i) {
      points.push({key: x, count: 1});
    } else {
      points.forEach(y => {
        if (x === y.key) y.count += 1
      });
    }
  });

  red.forEach((x) => {
    points.forEach(y => {
      if (x === y.key) y.count -= 1
    });
  });

  points.sort((a, b) => b.count - a.count);

  const ans = (points[0].count >= 0) ? points[0].count : 0;
  console.log(ans);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
