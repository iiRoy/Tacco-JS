let globalCardinality;
let globalTargetMean;
let globalValueList;
let finalTally = 0;

function assessSubgroup(idx, accumulatedValue, elementsChosen) {
  if (idx === globalCardinality) {
    if (elementsChosen > 0 && accumulatedValue / elementsChosen === globalTargetMean) {
      finalTally++;
    }
    return;
  }

  assessSubgroup(idx + 1, accumulatedValue, elementsChosen);

  assessSubgroup(idx + 1, accumulatedValue + globalValueList[idx], elementsChosen + 1);
}

let storedInput = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
  storedInput += chunk;
});

process.stdin.on('end', () => {
  const lineSeparators = storedInput.trim().split('\n');

  const firstEntry = lineSeparators[0].split(' ').map(Number);
  globalCardinality = firstEntry[0];
  globalTargetMean = firstEntry[1];

  globalValueList = lineSeparators[1].split(' ').map(Number);

  assessSubgroup(0, 0, 0);

  console.log(finalTally);
});