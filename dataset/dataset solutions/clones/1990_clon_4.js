function processData(rawData) {
  const lineSegments = rawData.split('\n');
  const extent = Number(lineSegments[0]);
  const charSequence = lineSegments[1];

  const charCountsFromEnd = Array(extent + 1).fill(null).map(() => ({ 'R': 0, 'G': 0, 'B': 0 }));

  for (let currentIdx = extent - 1; currentIdx >= 0; --currentIdx) {
    charCountsFromEnd[currentIdx] = { ...charCountsFromEnd[currentIdx + 1] };
    const charAtCurrent = charSequence[currentIdx];
    charCountsFromEnd[currentIdx][charAtCurrent]++;
  }

  let finalTally = 0;

  for (let firstSpot = 0; firstSpot < extent - 2; ++firstSpot) {
    for (let secondSpot = firstSpot + 1; secondSpot < extent - 1; ++secondSpot) {
      const firstChar = charSequence[firstSpot];
      const secondChar = charSequence[secondSpot];

      if (firstChar === secondChar) {
        continue;
      }

      const availableChars = new Set(['R', 'G', 'B']);
      availableChars.delete(firstChar);
      availableChars.delete(secondChar);
      const thirdChar = Array.from(availableChars)[0];

      let possibleThirds = charCountsFromEnd[secondSpot + 1][thirdChar];

      const thirdSpotCandidate = 2 * secondSpot - firstSpot;

      if (thirdSpotCandidate < extent && charSequence[thirdSpotCandidate] === thirdChar) {
        possibleThirds--;
      }

      finalTally += possibleThirds;
    }
  }

  console.log(finalTally);
}
processData(require("fs").readFileSync("/dev/stdin", "utf8"));