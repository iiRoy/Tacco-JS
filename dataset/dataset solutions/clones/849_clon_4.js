'use strict';

function extractLiteral(valStr) {
  const charCount = valStr.length;
  return function (srcTxt, currIdx) {
    if (srcTxt.startsWith(valStr, currIdx)) {
      return { matched: true, content: valStr, nextIndex: currIdx + charCount };
    } else {
      return { matched: false, content: null, nextIndex: currIdx };
    }
  };
}

function selectAlternative(...processors) {
  return function (sourceText, currentPosition) {
    function findMatch(idx) {
      if (idx >= processors.length) {
        return { matched: false, content: null, nextIndex: currentPosition };
      }
      const currentProcessor = processors[idx];
      const outcome = currentProcessor(sourceText, currentPosition);
      if (outcome.matched) {
        return outcome;
      } else {
        return findMatch(idx + 1);
      }
    }
    return findMatch(0);
  };
}