let inputBuffer = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  inputBuffer += chunk;
});

process.stdin.on('end', () => {
  const allInputLines = inputBuffer.trim().split('\n');
  const [initialSequence, operationCountStr, ...commandLines] = allInputLines;

  const parseInstruction = (lineText) => {
    const parts = lineText.split(' ');
    const instructionType = parts[0];
    const instructionParams = parts.slice(1);

    if (instructionType === 'print' || instructionType === 'reverse') {
      return {
        type: instructionType,
        params: instructionParams.map(Number)
      };
    } else if (instructionType === 'replace') {
      return {
        type: instructionType,
        params: [Number(instructionParams[0]), Number(instructionParams[1]), instructionParams[2]]
      };
    }
    throw new Error(`Unrecognized instruction: ${instructionType}`);
  };

  const parsedInstructions = commandLines.map(parseInstruction);

  let currentSequence = initialSequence;

  const commandExecutor = {
    'print': (sequence, startIndex, endIndex) => {
      console.log(sequence.slice(startIndex, endIndex + 1));
      return sequence;
    },
    'reverse': (sequence, startIndex, endIndex) => {
      return reverseSegment(sequence, startIndex, endIndex);
    },
    'replace': (sequence, startIndex, endIndex, newSegment) => {
      return replaceSegment(sequence, startIndex, endIndex, newSegment);
    }
  };

  for (const instruction of parsedInstructions) {
    const {
      type,
      params
    } = instruction;
    currentSequence = commandExecutor[type](currentSequence, ...params);
  }
});

const reverseSegment = (targetString, startIndex, endIndex) => {
  const charArray = Array.from(targetString);
  const segmentLength = endIndex - startIndex + 1;

  const segmentToReverse = charArray.slice(startIndex, endIndex + 1);
  segmentToReverse.reverse();

  charArray.splice(startIndex, segmentLength, ...segmentToReverse);

  return charArray.join('');
};

const replaceSegment = (targetString, startIndex, endIndex, newSegment) => {
  const charArray = Array.from(targetString);
  const segmentLength = endIndex - startIndex + 1;

  charArray.splice(startIndex, segmentLength, ...Array.from(newSegment));

  return charArray.join('');
};
