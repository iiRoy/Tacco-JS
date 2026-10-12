function processInput(rawContent) {
  const [valA, valB, valC] = rawContent.trim().split(" ").map(Number);

  // The original logic calculates the number of 'valB' segments that can fit
  // within 'valA', considering an initial 'valC' segment, a 'valC' segment
  // after each 'valB' segment, and a final 'valC' segment.
  // This can be expressed as:
  // Total length 'valA' must accommodate 'k' segments of 'valB' and 'k+1' segments of 'valC'.
  // valA >= k * valB + (k + 1) * valC
  // valA >= k * valB + k * valC + valC
  // valA - valC >= k * (valB + valC)
  // k <= (valA - valC) / (valB + valC)
  // The maximum integer 'k' is therefore Math.floor((valA - valC) / (valB + valC)).

  const finalCount = Math.floor((valA - valC) / (valB + valC));
  console.log(finalCount);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
