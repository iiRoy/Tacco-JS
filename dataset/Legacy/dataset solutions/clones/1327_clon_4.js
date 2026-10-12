'use strict';
(function(fileSystemModule) {
  const inputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

  const blockPattern = /[A-Za-z]+\n([1-9][0-9]*\n)+/g;
  const allMatchedBlocks = inputContent.match(blockPattern);

  // The original code would throw a TypeError if allMatchedBlocks is null
  // (e.g., if inputContent does not match the regex at all)
  // when attempting to call .map() on it.
  // The for...of loop will similarly throw a TypeError if allMatchedBlocks is null,
  // preserving this error behavior.

  const finalOutputSegments = [];

  for (const currentRawBlock of allMatchedBlocks) {
    // Decompose each matched block into its initial string and numeric lines.
    // The outer blockPattern ensures this inner regex will always match.
    const blockDecomposition = currentRawBlock.match(/^([A-Za-z]+)\n([\s\S]*)$/);

    const baseString = blockDecomposition[1];
    const numericLines = blockDecomposition[2].split('\n').filter(Boolean);

    // The original code's v.slice(-v[1]) effectively extracts only the last number
    // from the sequence of numbers in a block.
    const lastNumericValueStr = numericLines[numericLines.length - 1];
    const rotationMagnitude = Number(lastNumericValueStr);

    // Preserve exact console output as per Type IV rules.
    console.log(rotationMagnitude);

    const stringCharacterArray = Array.from(baseString);
    const stringLength = stringCharacterArray.length;

    if (stringLength === 0) {
        finalOutputSegments.push('');
        continue;
    }

    // Calculate the effective rotation amount, handling cases where
    // rotationMagnitude is greater than or equal to the string length.
    const effectiveRotation = rotationMagnitude % stringLength;

    // Create a new array to store the rotated characters.
    const rotatedCharacterSequence = new Array(stringLength);

    // Perform the cyclic right rotation using array indexing and modulo arithmetic.
    for (let charIndex = 0; charIndex < stringLength; charIndex++) {
        rotatedCharacterSequence[charIndex] = stringCharacterArray[(effectiveRotation + charIndex) % stringLength];
    }

    const rotatedStringResult = rotatedCharacterSequence.join('');
    finalOutputSegments.push(rotatedStringResult);
  }

  console.log(finalOutputSegments.join('\n'));
}(require('fs')));
