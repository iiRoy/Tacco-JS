function main(input) {
  const allLines = input.split('\n');

  const blueItemCount = Number(allLines[0]);
  const redItemCount = Number(allLines[blueItemCount + 1]);

  const blueItems = allLines.slice(1, blueItemCount + 1);
  const redItems = allLines.slice(blueItemCount + 2, blueItemCount + 2 + redItemCount);

  const itemScores = new Map();

  blueItems.forEach(itemIdentifier => {
    itemScores.set(itemIdentifier, (itemScores.get(itemIdentifier) || 0) + 1);
  });

  redItems.forEach(itemIdentifier => {
    itemScores.set(itemIdentifier, (itemScores.get(itemIdentifier) || 0) - 1);
  });

  let currentMaxScore;

  if (itemScores.size > 0) {
    currentMaxScore = Math.max(...Array.from(itemScores.values()));
  }

  let finalOutputValue;
  if (currentMaxScore === undefined) {
    finalOutputValue = undefined;
  } else if (currentMaxScore < 0) {
    finalOutputValue = 0;
  } else {
    finalOutputValue = currentMaxScore;
  }

  console.log(finalOutputValue);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
