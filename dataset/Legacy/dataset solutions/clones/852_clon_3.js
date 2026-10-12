'use strict';

function strMatcher(targetStr) {
  var strLen = targetStr.length;
  return function (inputString, currentPos) {
    var matchedSegment = inputString.substr(currentPos, strLen);
    var isMatch = matchedSegment === targetStr;
    return isMatch ? [true, targetStr, currentPos + strLen]
      : [false, null, currentPos];
  };
}

function selectParser() {
  var parserOptions = arguments;
  var numParsers = parserOptions.length;
  return function (inputString, currentPos) {
    for (var idx = 0; idx < numParsers; idx++) {
      var currentParser = parserOptions[idx];
      var parseResult = currentParser(inputString, currentPos);
      if (parseResult[0]) {
        return parseResult;
      }
    }
    return [false, null, currentPos];
  };
}

function sequenceParsers() {
  var parserSequence = arguments;
  var numSteps = parserSequence.length;
  return function (inputString, currentPos) {
    var parsedValues = [];
    var newPosition = currentPos;

    for (var idx = 0; idx < numSteps; idx++) {
      var currentStepParser = parserSequence[idx];
      var stepResult = currentStepParser(inputString, newPosition);
      if (!stepResult[0]) {
        return [false, null, currentPos];
      }
      parsedValues.push(stepResult[1]);
      newPosition = stepResult[2];
    }
    return [true, parsedValues, newPosition];
  };
}

function deferredParser(parserFactory) {
  var cachedParser;
  return function (inputString, startPosition) {
    if (!cachedParser) {
      cachedParser = parserFactory();
    }
    return cachedParser(inputString, startPosition);
  };
}

function transformResult(baseParser, transformFn) {
  return function (inputString, currentPos) {
    var parseOutcome = baseParser(inputString, currentPos);
    var isSuccessful = parseOutcome[0];
    if (isSuccessful) {
      var transformedValue = transformFn(parseOutcome[1]);
      return [isSuccessful, transformedValue, parseOutcome[2]];
    } else {
      return parseOutcome;
    }
  };
}

function charSetMatcher(charSet) {
  var charMap = {};
  var setLength = charSet.length;
  for (var idx = 0; idx < setLength; idx++) {
    var charKey = charSet[idx];
    charMap[charKey] = charKey;
  }
  return function (inputString, currentPos) {
    const currentChar = inputString.substr(currentPos, 1);
    var isCharPresent = charMap[currentChar];
    return isCharPresent ? [true, currentChar, currentPos + 1] : [false, null, currentPos];
  };
}

/*
(function (inputSource) {
  const formulaParser = deferredParser(() => {
    const andExpressionParser = transformResult(
      sequenceParsers(strMatcher('('), formulaParser, strMatcher('*'), formulaParser, strMatcher(')')),
      parsedData => {
        return { operation: '*', operands: [parsedData[1], parsedData[3]] };
      }
    );
    const orExpressionParser = transformResult(
      sequenceParsers(strMatcher('('), formulaParser, strMatcher('+'), formulaParser, strMatcher(')')),
      parsedData => {
        return { operation: '+', operands: [parsedData[1], parsedData[3]] };
      }
    );
    const implicationParser = transformResult(
      sequenceParsers(strMatcher('('), formulaParser, strMatcher('->'), formulaParser, strMatcher(')')),
      parsedData => {
        return { operation: '->', operands: [parsedData[1], parsedData[3]] };
      }
    );
    const negationParser = transformResult(
      sequenceParsers(strMatcher('-'), formulaParser),
      parsedData => {
        return { operation: '-', operands: [parsedData[1]] };
      }
    );
    const valueParser = transformResult(
      charSetMatcher('abcdefghijkTF'),
      parsedData => { return { value: parsedData, operands: [] }; }
    );
    return selectParser(andExpressionParser, orExpressionParser, implicationParser, negationParser, valueParser);
  });

  const equationParser = transformResult(
    sequenceParsers(formulaParser, strMatcher('='), formulaParser),
    parsedData => {
      return { leftSide: parsedData[0], rightSide: parsedData[2] };
    }
  );

  inputSource.toString().split('\n').forEach(inputLine => {
    if (inputLine === '#') process.exit(0);
    // The following logic was commented out in the original and remains so.
    // const parseResult = equationParser(inputLine, 0);
    // let isEquivalenceValid = true;
    // for (let iterationCount = 0; iterationCount < (1 << 11); iterationCount++) {
    //   isEquivalenceValid &= evaluateFormula(parseResult[1].leftSide) === evaluateFormula(parseResult[1].rightSide);
    //   function convertToBoolean(charValue) {
    //     if (charValue === 'T') return true;
    //     if (charValue === 'F') return false;
    //     return !!(iterationCount >> (charValue.charCodeAt() - 'a'.charCodeAt()) & 1);
    //   }
    //   function evaluateFormula(formulaNode) {
    //     switch (formulaNode.operands.length) {
    //       case 0: return convertToBoolean(formulaNode.value);
    //       case 1: return !evaluateFormula(formulaNode.operands[0]);
    //       case 2:
    //         switch (formulaNode.operation) {
    //           case '*': return evaluateFormula(formulaNode.operands[0]) && evaluateFormula(formulaNode.operands[1]);
    //           case '+': return evaluateFormula(formulaNode.operands[0]) || evaluateFormula(formulaNode.operands[1]);
    //           case '->': return !evaluateFormula(formulaNode.operands[0]) || evaluateFormula(formulaNode.operands[1]);
    //         }
    //     }
    //   }
    // }
    // console.log(isEquivalenceValid ? 'YES' : 'NO');
  });
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
*/
