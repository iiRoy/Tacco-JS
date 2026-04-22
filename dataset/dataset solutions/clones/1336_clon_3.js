((inputSourceData) => {
  let inputDataSegments = inputSourceData.toString().split('\n');

  const getParsedInteger = (value, fallback = -1) => {
    const num = Number(value);
    return Number.isInteger(num) ? num : fallback;
  };

  const TextTransformer = function(initialStringForProcessing) {
    this.currentWorkingText = initialStringForProcessing;
    this.transformationLog = [];
    this.processingMessages = [];
  };

  TextTransformer.prototype.executeOperation = function(operationKey, targetRange, auxiliaryParameter) {
    const processorInstanceRef = this;
    const [startIndex, endIndex] = targetRange;

    if (startIndex < 0 || endIndex >= processorInstanceRef.currentWorkingText.length || startIndex > endIndex) {
      processorInstanceRef.processingMessages.push(`WARNING: Invalid range [${startIndex}, ${endIndex}] for operation '${operationKey}'. Skipping.`);
      return;
    }

    switch (operationKey) {
      case 'print':
        processorInstanceRef.displayFragment(startIndex, endIndex);
        break;
      case 'reverse':
        processorInstanceRef.invertFragment(startIndex, endIndex);
        break;
      case 'replace':
        if (typeof auxiliaryParameter !== 'string') {
          processorInstanceRef.processingMessages.push(`ERROR: 'replace' operation requires a string parameter. Received type: ${typeof auxiliaryParameter}.`);
          return;
        }
        processorInstanceRef.substituteFragment(startIndex, endIndex, auxiliaryParameter);
        break;
      default:
        processorInstanceRef.processingMessages.push(`ERROR: Unknown operation key '${operationKey}' encountered.`);
        break;
    }
  };

  TextTransformer.prototype.displayFragment = function(startIdx, endIdx) {
    const extractedSegment = this.currentWorkingText.slice(startIdx, endIdx + 1);
    this.transformationLog.push(extractedSegment);
    this.processingMessages.push(`INFO: Displayed fragment from ${startIdx} to ${endIdx}: "${extractedSegment}"`);
  };

  TextTransformer.prototype.invertFragment = function(startIdx, endIdx) {
    let textCharactersArray = this.currentWorkingText.split('');
    const segmentToProcess = textCharactersArray.slice(startIdx, endIdx + 1);
    const invertedSegment = segmentToProcess.reverse().join('');
    this.substituteFragment(startIdx, endIdx, invertedSegment);
    this.processingMessages.push(`INFO: Inverted fragment from ${startIdx} to ${endIdx}.`);
  };

  TextTransformer.prototype.substituteFragment = function(startIdx, endIdx, replacementValue) {
    let textCharactersArray = this.currentWorkingText.split('');
    const segmentLength = endIdx - startIdx + 1;

    textCharactersArray.splice(startIdx, segmentLength, replacementValue);
    this.currentWorkingText = textCharactersArray.join('');
    this.processingMessages.push(`INFO: Substituted fragment at [${startIdx}, ${endIdx}] with "${replacementValue}".`);
  };

  TextTransformer.prototype.getFinalResultString = function() {
    return this.transformationLog.join('\n');
  };

  if (inputDataSegments.length === 0 || inputDataSegments[0] === undefined) {
    console.error("Error: No input data provided or initial string is missing.");
    return;
  }

  const initialContentString = inputDataSegments.shift();

  if (initialContentString === null || initialContentString === undefined || initialContentString.length === 0) {
      console.error("Error: The initial content string is empty or invalid.");
      return;
  }

  const instructionCountLine = inputDataSegments.shift();
  const totalNumberOfInstructions = getParsedInteger(instructionCountLine, 0);

  if (totalNumberOfInstructions <= 0) {
    console.error(`Error: Invalid or non-positive number of instructions specified: '${instructionCountLine}'. No operations will be performed.`);
    return;
  }

  const rawInstructionLines = inputDataSegments.slice(0, totalNumberOfInstructions);

  const processingInstructions = rawInstructionLines.map((lineContent, index) => {
    const parts = lineContent.split(' ');
    if (parts.length < 3 || parts.length > 4) {
      console.warn(`WARNING: Instruction line ${index + 1} ("${lineContent}") has an invalid number of parts. Skipping.`);
      return null;
    }

    const operation = parts[0];
    const firstIndex = getParsedInteger(parts[1]);
    const secondIndex = getParsedInteger(parts[2]);
    const parameter = parts[3] || '';

    if (firstIndex === -1 || secondIndex === -1 || firstIndex > secondIndex) {
      console.warn(`WARNING: Instruction line ${index + 1} ("${lineContent}") contains invalid numeric indices. Skipping.`);
      return null;
    }

    return [operation, firstIndex, secondIndex, parameter];
  }).filter(Boolean);

  const transformerInstance = new TextTransformer(initialContentString);

  processingInstructions.forEach((currentInstructionSet) => {
    const [operationName, startPos, endPos, supplementaryArg] = currentInstructionSet;
    transformerInstance.executeOperation(operationName, [startPos, endPos], supplementaryArg);
  });

  const finalTransformedOutput = transformerInstance.getFinalResultString();
  console.log(finalTransformedOutput);

  if (transformerInstance.processingMessages.length > 0) {
    console.error("\n--- Internal Processing Log ---");
    transformerInstance.processingMessages.forEach(msg => console.error(msg));
  }

})(
  require('fs').readFileSync('/dev/stdin', 'utf8')
);