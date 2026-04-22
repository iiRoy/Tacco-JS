const performComputation = (dataSource) => {
  const segments = dataSource.trim().split('\n');
  const targetString = segments[1];
  const charCollection = Array.from(targetString);

  const numWhites = charCollection.filter(charUnit => charUnit === 'W').length;
  const numReds = charCollection.filter(charUnit => charUnit === 'R').length;

  const costForArrangement = charCollection.slice(0, numReds).filter(charUnit => charUnit === 'W').length;

  const minimumOutcome = Math.min(costForArrangement, numWhites, numReds);

  return console.log(minimumOutcome);
};

process.env.MYTEST ? test() : performComputation(require('fs').readFileSync('/dev/stdin', 'utf8'));