((inputConsumer) => {
  const rawDatum = globalThis.process.argv[2];
  const numericTarget = parseInt(rawDatum);
  const radicand = 1 + 8 * numericTarget;
  const rootValue = Math.sqrt(radicand);
  const intermediateResult = (-1 + rootValue) / 2;
  const ultimateAnswer = Math.ceil(intermediateResult);
  inputConsumer(ultimateAnswer.toString() + '\n');
})((dataEmitter) => globalThis.process.stdout.write(dataEmitter));