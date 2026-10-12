function processStringForSegments(sourceStr) {
  const segmentStack = [];
  const strLen = sourceStr.length;
  let segmentCount;

  const getChar = (targetString, charIdx) => {
    if (charIdx >= 0 && charIdx < targetString.length) {
      return targetString[charIdx];
    }
    return '';
  };

  for (let charIndex = strLen - 1; charIndex >= 0; charIndex--) {
    const currentCh = getChar(sourceStr, charIndex);

    if (segmentStack.length === 0) {
      segmentStack.push(currentCh);
    } else {
      const lastSegmentTop = segmentStack[segmentStack.length - 1];
      
      if (lastSegmentTop === currentCh) {
        const previousCh = getChar(sourceStr, charIndex - 1);
        const combinedSegment = previousCh + currentCh;
        segmentStack.push(combinedSegment);
        charIndex--;
      } else {
        segmentStack.push(currentCh);
      }
    }
  }

  segmentCount = segmentStack.length;

  const initialChar = getChar(sourceStr, 0);
  const nextChar = getChar(sourceStr, 1);

  if (initialChar === nextChar) {
    segmentCount--;
  }
  
  console.log(segmentCount.toString());
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
processStringForSegments(fileContent);
