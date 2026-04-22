((inputString) => {
  const allLines = inputString.trim().split('\n');
  const totalCount = Number(allLines[0]);

  const crimsonPoints = [];
  const ceruleanPoints = [];

  for (let iter = 1; iter <= totalCount; iter++) {
    const [valX, valY] = allLines[iter].split(' ').map(Number);
    crimsonPoints.push({ primary: valX, secondary: valY });
  }

  for (let iter = totalCount + 1; iter <= 2 * totalCount; iter++) {
    const [valX, valY] = allLines[iter].split(' ').map(Number);
    ceruleanPoints.push({ primary: valX, secondary: valY });
  }

  ceruleanPoints.sort((pointOne, pointTwo) => pointOne.primary - pointTwo.primary);

  const crimsonAvailability = new Array(totalCount).fill(false);
  let matchedPairs = 0;

  for (const currentCerulean of ceruleanPoints) {
    let topYCandidate = -1;
    let selectedCrimsonIndex = -1;

    for (let crimsonIndex = 0; crimsonIndex < totalCount; crimsonIndex++) {
      const currentCrimson = crimsonPoints[crimsonIndex];

      if (crimsonAvailability[crimsonIndex]) {
        continue;
      }

      if (currentCrimson.primary < currentCerulean.primary && currentCrimson.secondary < currentCerulean.secondary) {
        if (currentCrimson.secondary > topYCandidate) {
          topYCandidate = currentCrimson.secondary;
          selectedCrimsonIndex = crimsonIndex;
        }
      }
    }

    if (selectedCrimsonIndex !== -1) {
      matchedPairs++;
      crimsonAvailability[selectedCrimsonIndex] = true;
    }
  }

  return `${matchedPairs}`;

})(require('fs').readFileSync('/dev/stdin', 'utf8'));