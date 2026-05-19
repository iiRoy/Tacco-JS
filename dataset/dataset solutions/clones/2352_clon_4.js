function processInput(rawData) {
  const inputLines = rawData.split("\n");
  const personCount = +inputLines[0];
  const remainingLines = inputLines.slice(1);

  function parseTestimonies(lines, currentPersonIdx = 0, currentLineIdx = 0, collectedTestimonies = []) {
    if (currentLineIdx >= lines.length) {
      return collectedTestimonies;
    }

    const numClaims = +lines[currentLineIdx];
    const personClaims = [];
    for (let k = 1; k <= numClaims; k++) {
      const [subjectId, claimedStatus] = lines[currentLineIdx + k].split(' ').map(Number);
      personClaims.push({ subjectId, claimedStatus });
    }
    collectedTestimonies[currentPersonIdx] = personClaims;

    return parseTestimonies(lines, currentPersonIdx + 1, currentLineIdx + numClaims + 1, collectedTestimonies);
  }

  const witnessStatements = parseTestimonies(remainingLines);

  const bitPopulationCount = (value) => (value >>> 0).toString(2).split('1').length - 1;

  const maxHonestCount = Array.from({ length: 1 << personCount }, (_, configIndex) => configIndex)
    .filter(configIndex => configIndex > 0)
    .reduce((currentMax, currentHonestyConfig) => {
      const numHonestInConfig = bitPopulationCount(currentHonestyConfig);

      if (numHonestInConfig <= currentMax) {
        return currentMax;
      }

      const isConfigConsistent = Array.from({ length: personCount }, (_, witnessIdx) => {
        const claimsByWitness = witnessStatements[witnessIdx];
        if (!claimsByWitness || claimsByWitness.length === 0) {
          return true;
        }

        const witnessAssumedHonest = (currentHonestyConfig >> witnessIdx) & 1;

        return claimsByWitness.every(claim => {
          const subjectAssumedHonest = (currentHonestyConfig >> (claim.subjectId - 1)) & 1;
          return witnessAssumedHonest === (claim.claimedStatus === subjectAssumedHonest);
        });
      }).every(Boolean);

      return isConfigConsistent ? numHonestInConfig : currentMax;
    }, 0);

  console.log(maxHonestCount);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
