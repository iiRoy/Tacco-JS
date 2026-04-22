((input) => {
  const data = input.split('\n')[0].split(' ');
  // ノードの数
  const N = +data[0];
  // 最短距離が2になるノードの組み合わせの数
  const K = +data[1];

  // console.log(`N = ${N}`);
  // console.log(`K <= ${(N - 2) * (N - 1) / 2}`);

  if (N <= 2) {
    console.log('-1');
    return;
  }

  const max = (N - 2) * (N - 1) / 2;

  if (N > max) {
    console.log('-1');
    return;
  }

  // 1が真ん中で1と他のノードを全て繋ぐ
  const edges = Array(N - 1)
    .fill(null)
    .map((_, i) => [1, i + 2])
    .concat(
      Array(max - K)
        .fill(null)
        .map((_, i) => [i + 2, i + 3])
    );

  console.log(edges.length);
  console.log(edges.map(edge => edge.join(' ')).join('\n'));
})(
  require("fs").readFileSync("/dev/stdin", "utf8")
);

