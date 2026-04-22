const processSequenceForSwaps = (inputStringData) => {
  const contentLines = inputStringData.split('\n');
  const characterElements = contentLines[1].split('');

  const totalRedMarkers = characterElements.filter(element => element === 'R').length;

  let misplacedWhiteMarkers = 0;
  for (let k = 0; k < totalRedMarkers; k++) {
    if (characterElements[k] === 'W') {
      misplacedWhiteMarkers++;
    }
  }

  console.log(misplacedWhiteMarkers);
};

processSequenceForSwaps(require('fs').readFileSync('/dev/stdin', 'utf8').trim());