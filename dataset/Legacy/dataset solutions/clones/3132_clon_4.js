function formBinaryReflected(bitCount) {
  if (bitCount === 0) {
    return [0];
  }
  const priorCodes = formBinaryReflected(bitCount - 1);
  const mirroredCodes = [...priorCodes].reverse().map(val => val | (1 << (bitCount - 1)));
  return priorCodes.concat(mirroredCodes);
}

function deriveFlipProgression(indexParameter) {
  const highestBitIndex = 2 * indexParameter;
  let initialSequence = formBinaryReflected(highestBitIndex).slice(1); // G for 2m bits, shifted
  
  const finalState = Array.from({ length: highestBitIndex }).reduce((accumulator, _, currentBit) => {
    const reducedSequence = accumulator.currentBasis.filter(entry => !((entry >>> currentBit) & 1));
    const lastValueInPath = accumulator.currentPath[accumulator.currentPath.length - 1];
    
    const segmentFromReduced = reducedSequence.map(entry => lastValueInPath ^ entry);
    const pathExtendedWithSegment = accumulator.currentPath.concat(segmentFromReduced);
    
    const lastValueAfterSegment = pathExtendedWithSegment[pathExtendedWithSegment.length - 1];
    
    return {
      currentPath: pathExtendedWithSegment.concat(lastValueAfterSegment ^ (1 << currentBit)),
      currentBasis: reducedSequence
    };
  }, { currentPath: [0], currentBasis: initialSequence });

  const finalValueBeforeLastFlip = finalState.currentPath[finalState.currentPath.length - 1];
  return finalState.currentPath.concat(finalValueBeforeLastFlip ^ (1 << highestBitIndex));
}

function executeSequenceGeneration(sourceData) {
  const parsedValues = sourceData.trim().split(/\s+/).map(str => parseInt(str, 10));
  const totalBitLength = parsedValues.shift();
  const initialConfiguration = parsedValues.shift();
  const targetConfiguration = parsedValues.shift();

  const bitDifferenceMask = initialConfiguration ^ targetConfiguration;
  
  const bitGroupings = Array.from({ length: totalBitLength }).reduce((groups, _, idx) => {
    if (!((bitDifferenceMask >> idx) & 1)) {
      groups.consistentPositions.push(idx);
    } else {
      groups.divergentPositions.push(idx);
    }
    return groups;
  }, { consistentPositions: [], divergentPositions: [] });

  const consistentPositions = bitGroupings.consistentPositions;
  const divergentPositions = bitGroupings.divergentPositions;

  if (divergentPositions.length % 2 === 0) {
    console.log('NO');
    return;
  }
  console.log('YES');
  
  const consistentPatternValues = formBinaryReflected(consistentPositions.length).slice(1);
  const mappedConsistentPattern = consistentPatternValues.map(val => 
    consistentPositions.reduce((acc, targetBitPos, sourceBitPos) => {
      return acc | (((val >> sourceBitPos) & 1) << targetBitPos);
    }, 0)
  );

  const divergentPatternValues = deriveFlipProgression(divergentPositions.length - 1).slice(1);
  const mappedDivergentPattern = divergentPatternValues.map(val => 
    divergentPositions.reduce((acc, targetBitPos, sourceBitPos) => {
      return acc | (((val >> sourceBitPos) & 1) << targetBitPos);
    }, 0)
  );
  
  const constructedPath = mappedDivergentPattern.reduce((pathSegments, currentDivergentStep) => {
    let lastPathElement = pathSegments[pathSegments.length - 1];
    
    const intermediateSegment = mappedConsistentPattern.map(consistentStep => {
      lastPathElement ^= consistentStep;
      return lastPathElement;
    });
    
    lastPathElement = intermediateSegment.length > 0 ? intermediateSegment[intermediateSegment.length - 1] : lastPathElement;
    lastPathElement ^= currentDivergentStep;
    
    return pathSegments.concat(intermediateSegment, lastPathElement);
  }, [initialConfiguration]);

  constructedPath.push(targetConfiguration);
  
  console.log(constructedPath.join(' '));
}

executeSequenceGeneration(require("fs").readFileSync("/dev/stdin","utf8"));