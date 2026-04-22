'use strict';

function atomizer(pattern) {
  var lengthOfPattern = pattern.length;
  return function (inputString, currentPosition) {
    return inputString.substr(currentPosition, lengthOfPattern) === pattern
      ? [true, pattern, currentPosition + lengthOfPattern]
      : [false, null, currentPosition];
  }
}

function alternative() {
  var analyzers = arguments;
  return function (inputString, currentPosition) {
    for (var idx = 0; idx < analyzers.length; idx++) {
      var analysisResult = analyzers[idx](inputString, currentPosition);
      if (analysisResult[0]) return analysisResult;
    }
    return [false, null, currentPosition];
  };
}

function sequenceBuilder() {
  var analyzers = arguments;
  return function (inputString, currentPosition) {
    var collectedItems = [];
    var nextParsingPoint = currentPosition;
    for (var idx = 0; idx < analyzers.length; idx++) {
      var analysisResult = analyzers[idx](inputString, nextParsingPoint);
      if (!analysisResult[0]) return [false, null, currentPosition];
      collectedItems.push(analysisResult[1]);
      nextParsingPoint = analysisResult[2];
    }
    return [true, collectedItems, nextParsingPoint];
  };
}

function deferred(parserFactory) {
  var memoizedParser;
  return function (inputString, currentPosition) {
    if (!memoizedParser) memoizedParser = parserFactory();
    return memoizedParser(inputString, currentPosition);
  };
}

function transformResult(baseParser, transformationFunc) {
  return function (inputString, currentPosition) {
    var analysisResult = baseParser(inputString, currentPosition);
    return analysisResult[0] ? [analysisResult[0], transformationFunc(analysisResult[1]), analysisResult[2]]
      : analysisResult;
  };
}

function anyCharFrom(characterSet) {
  var characterMap = {};
  for (var idx = 0; idx < characterSet.length; idx++) characterMap[characterSet[idx]] = characterSet[idx];
  return function (inputString, currentPosition) {
    var currentChar = inputString.substr(currentPosition, 1);
    return characterMap[currentChar] ? [true, currentChar, currentPosition + 1] : [false, null, currentPosition];
  };
}

(function (inputContent) {
  var expressionParser = deferred(function () {
    var conjunctionParser = transformResult(sequenceBuilder(atomizer('('), expressionParser, atomizer('*'), expressionParser, atomizer(')')), function (parsedSegments) {
      return { operatorSymbol: '*', operands: [parsedSegments[1], parsedSegments[3]] };
    });
    var disjunctionParser = transformResult(sequenceBuilder(atomizer('('), expressionParser, atomizer('+'), expressionParser, atomizer(')')), function (parsedSegments) {
      return { operatorSymbol: '+', operands: [parsedSegments[1], parsedSegments[3]] };
    });
    var implicationParser = transformResult(sequenceBuilder(atomizer('('), expressionParser, atomizer('->'), expressionParser, atomizer(')')), function (parsedSegments) {
      return { operatorSymbol: '->', operands: [parsedSegments[1], parsedSegments[3]] };
    });
    var negationParser = transformResult(sequenceBuilder(atomizer('-'), expressionParser), function (parsedSegments) {
      return { operatorSymbol: '-', operands: [parsedSegments[1]] };
    });
    var valueParser = transformResult(anyCharFrom('abcdefghijkTF'), function (parsedSegments) { return { evaluatedValue: parsedSegments, operands: [] }; });
    return alternative(conjunctionParser, disjunctionParser, implicationParser, negationParser, valueParser);
  });
  var statementParser = transformResult(sequenceBuilder(expressionParser, atomizer('='), expressionParser), function (parsedSegments) {
    return { lhs: parsedSegments[0], rhs: parsedSegments[2] };
  });

  inputContent.toString().split('\n').forEach(function (currentLine) {
    if (currentLine == '#') process.exit(0);
    var parsingOutcome = statementParser(currentLine, 0);
    var isEquivalenceValid = true;
    for (var assignmentIndex = 0; assignmentIndex < (1 << 11); assignmentIndex++) {
      var interpretAsBoolean = function (charValue) {
        if (charValue === 'T') return true;
        if (charValue === 'F') return false;
        return !!(assignmentIndex >> (charValue.charCodeAt() - 'a'.charCodeAt()) & 1);
      }
      var evaluateExpression = function (currentExpression) {
        switch (currentExpression.operands.length) {
          case 0: return interpretAsBoolean(currentExpression.evaluatedValue);
          case 1: return !evaluateExpression(currentExpression.operands[0]);
          case 2:
            switch (currentExpression.operatorSymbol) {
              case '*': return evaluateExpression(currentExpression.operands[0]) && evaluateExpression(currentExpression.operands[1]);
              case '+': return evaluateExpression(currentExpression.operands[0]) || evaluateExpression(currentExpression.operands[1]);
              case '->': return !evaluateExpression(currentExpression.operands[0]) || evaluateExpression(currentExpression.operands[1]);
            }
        }
      }
      // isEquivalenceValid = isEquivalenceValid && (evaluateExpression(parsingOutcome[1].lhs) === evaluateExpression(parsingOutcome[1].rhs));
    }
    console.log(isEquivalenceValid ? 'YES' : 'NO');
  });
})(require('fs').readFileSync('/dev/stdin', 'utf8'));