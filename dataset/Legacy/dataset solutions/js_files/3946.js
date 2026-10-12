'use strict'

function main(s) {
  s = s.split('\n')[1].split(' ').map(n => Number(n));

  const points = [0, ...s, 0];
  const diff   = [];
  const answer = [];

  points.forEach((p, i, self) => {
    if (i < self.length - 1) diff.push(self[i + 1] - self[i]);
  });

  const sum = diff.map(n => Math.abs(n)).reduce((a, b) => a + b);

  for (let i = 1; i < points.length - 1; i++) {

    // 該当の地点(b)を飛ばした場合の移動距離(a to c)
    const skipped = Math.abs(points[i - 1] - points[i + 1]);

    // 飛ばす前の移動距離((a to b) + (b to c))
    const stepped = Math.abs(points[i - 1] - points[i]) + Math.abs(points[i] - points[i + 1]);

    // 変更される移動距離((a to c) - ((a to b) + (b to c)))
    const changed = skipped - stepped;

    answer.push(sum + changed);
  }

  console.log(answer.join('\n'));
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
