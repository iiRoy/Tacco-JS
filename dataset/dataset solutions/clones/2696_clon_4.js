function evaluateNumericPair(paramA, paramB) {
  const sameParity = ((paramA ^ paramB) & 1) === 0;

  return sameParity ? ((paramA + paramB) >> 1) : "IMPOSSIBLE";
}

const firstArgument = Number(process.argv[2]);
const secondArgument = Number(process.argv[3]);

console.log(evaluateNumericPair(firstArgument, secondArgument));