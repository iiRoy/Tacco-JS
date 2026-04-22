process.stdin.setEncoding("utf8");
process.stdin.on("data", input => {
  // 3 4 9 0
  const inputArr = input.split(" ");
  const A = inputArr[0];
  const B = inputArr[1];
  const H = inputArr[2];
  const M = inputArr[3];
  const result = getResult(A, B, H, M);
  console.log(result);
});

const getResult = (A, B, H, M) => {
  const minuteDegree = (Math.PI * 2.0 * M) / 60;
  const hourDegree = Math.PI * 2 * (H / 12 + M / 60 / 12);
  const theta = minuteDegree - hourDegree;
  
  return calcCosinTheorem(A, B, theta);
};

const calcCosinTheorem = (A, B, theta) => {
  return Math.sqrt(A * A + B * B - 2 * A * B * Math.cos(theta));
};
