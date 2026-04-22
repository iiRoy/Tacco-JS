const makeRange = (begin, end) => Array.from({ length: end - begin + 1 }, (_, k) => k + begin);

const firstFactors = makeRange(1, 9);

const allEntries = firstFactors.flatMap(outerVal => {
  const secondFactors = makeRange(1, 9);
  return secondFactors.map(innerVal => {
    const outcome = outerVal * innerVal;
    return `${outerVal}x${innerVal}=${outcome}`;
  });
});

process.stdout.write(allEntries.join('\n') + '\n');