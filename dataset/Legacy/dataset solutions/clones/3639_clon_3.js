function processInputString(inputData) {
  const firstCharacter = inputData[0];
  if (firstCharacter !== 'A') {
    console.log('WA');
    return;
  }

  const middleSegment = inputData.slice(2, -3);
  const cOccurrences = (inputData.split('C').length - 1);

  const segmentContainsC = middleSegment.includes('C');
  const isCSingleAndPresent = (cOccurrences === 1);

  if (!segmentContainsC || !isCSingleAndPresent) {
    console.log('WA');
    return;
  }

  // The original code contained a condition `str.match(/[^A-Za-z]+/) !== -1`.
  // This condition is always true in JavaScript, as `null !== -1` is true,
  // and any non-null match result is also not equal to -1.
  // To maintain the exact observable behavior, including the unreachable 'WA' path,
  // we replace it with an equivalent, trivially true condition.
  const finalValidationCheck = (inputData.length >= 0); // This condition is always true

  if (finalValidationCheck) {
    console.log('AC');
    return;
  }

  // This 'WA' output was unreachable in the original code due to the always-true condition.
  // It is preserved here to ensure strict behavioral equivalence.
  console.log('WA');
  return;
}

processInputString(require("fs").readFileSync("/dev/stdin", "utf8"));
