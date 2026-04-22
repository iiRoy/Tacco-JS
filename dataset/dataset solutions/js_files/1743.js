process.stdin.resume();
process.stdin.setEncoding("utf8");
process.stdin.on("data", (input) => {
    const analyzed = analyzeInput(input);
    const result = getResult(analyzed.K, analyzed.Pk);

    console.log(result);
});

const analyzeInput = (input) => {
  const lines = input.split("\n");
  const line1 = lines[0].split(" ");
  const line2 = lines[1].split(" ");

  const N = line1[0];
  const K = line1[1];

  const pk = line2.map(num => Number(num));

  return {
    N: N,
    K: K,
    Pk: pk,
  };
};

const getResult = (k, pk) => {
  pk.sort((p1, p2) => {
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
    return 0;
  });

  const sum = pk.slice(0, k).reduce((total, curr) => {
    return total + curr;
  }, 0);

  return sum;
};


