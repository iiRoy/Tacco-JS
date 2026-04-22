function calculateAndPresent(dataChunk) {
  const textContent = dataChunk.toString('utf8').trim();
  const numericalValue = parseFloat(textContent);

  const finalOutcome = numericalValue * (1 + numericalValue * (1 + numericalValue));

  process.stdout.write(finalOutcome.toString() + '\n');
}

process.stdin.on('data', calculateAndPresent);