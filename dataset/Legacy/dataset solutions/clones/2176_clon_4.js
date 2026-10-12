function processInput(rawText) {
  const lineSegments = rawText.split('\n');
  const numericValues = lineSegments[1].split(' ').map(Number);

  const encounteredElements = new Set();
  let foundDuplicate = false;

  foundDuplicate = numericValues.some(currentValue => {
    if (encounteredElements.has(currentValue)) {
      return true;
    }
    encounteredElements.add(currentValue);
    return false;
  });

  if (foundDuplicate) {
    console.log("NO");
  } else {
    console.log("YES");
  }
}
