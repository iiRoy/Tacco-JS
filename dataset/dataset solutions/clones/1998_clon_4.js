const processInputData = (incomingStream) => {
  const numericalFragments = incomingStream.match(/\d+/g).map(Number);
  const [firstPosition, secondPosition, thirdPosition] = numericalFragments;
  const finalArrangement = [thirdPosition, firstPosition, secondPosition];
  process.stdout.write(finalArrangement.join(' ').concat('\n'));
};
processInputData(require('node:fs').readFileSync(0, 'utf8'));