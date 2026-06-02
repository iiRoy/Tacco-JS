const processInput = (sourceText) => {
  const lines = sourceText.trim().split('\n');
  const [firstSegmentLengthStr, secondSegmentLengthStr] = lines[0].split(' ');
  const firstSegmentLength = Number(firstSegmentLengthStr);
  const secondSegmentLength = Number(secondSegmentLengthStr);
  const targetString = lines[1];

  const verifyStructure = (candidate, lenA, lenB) => {
    const separatorPosition = candidate.indexOf('-');

    if (separatorPosition === -1 || candidate.lastIndexOf('-') !== separatorPosition) {
      return false;
    }

    const segmentOne = candidate.substring(0, separatorPosition);
    const segmentTwo = candidate.substring(separatorPosition + 1);

    if (segmentOne.length !== lenA || segmentTwo.length !== lenB) {
      return false;
    }

    const areAllNumeric = (segment) => {
      if (segment.length === 0) {
        return true;
      }
      return Array.from(segment).every(char => {
        const charCode = char.charCodeAt(0);
        return charCode >= 48 && charCode <= 57;
      });
    };

    return areAllNumeric(segmentOne) && areAllNumeric(segmentTwo);
  };

  if (verifyStructure(targetString, firstSegmentLength, secondSegmentLength)) {
    console.log('Yes');
  } else {
    console.log('No');
  }
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
