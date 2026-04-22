"use strict"
; var
    utilityModule = require("util")
  , outputLine = console.log
  , printToConsole = utilityModule.print
  , inputProcessor = createInputHandler()
;

function evaluateExpression() {
    var currentCalc = evaluateTerm();
    
    while
      (true)
    {
        if
          ( currentInputLine[positionTracker] === "+" )
        {
            positionTracker++;
            currentCalc += evaluateTerm();
        }
        else if ( currentInputLine[positionTracker] === "-" )
        {
            positionTracker++;
            currentCalc -= evaluateTerm();
        }
        else
        {
            break;
        }
    }
    return currentCalc;
}

function evaluateTerm() {
    var currentProduct = evaluateFactor();

    while( true )
    {
        if ( currentInputLine[positionTracker] === "*" )
        {
            positionTracker++;
            currentProduct *= evaluateFactor();
        }
        else if ( currentInputLine[positionTracker] === "/" )
        {
            positionTracker++;
            currentProduct = ~~(currentProduct / evaluateFactor());
        }
        else
        {
            break;
        }
    }
    return currentProduct;
}

function evaluateFactor() {
    while
      (true)
    {
        if ( currentInputLine[positionTracker] === "(" )
        {
            positionTracker++;
            return evaluateExpression();
        }
        else if ( currentInputLine[positionTracker] === ")" )
        {
            positionTracker++;
        }
        else
        {
            break;
        }
    }
    var parsedValue = parseNumericValue();
    return parsedValue;
}

function parseNumericValue() {
    var finalNumber;

    while ( true )
    {
        if
          ( /^\d/.test(currentInputLine[positionTracker]) )
        {
            finalNumber = finalNumber ? finalNumber * 10 + +currentInputLine[positionTracker] : +currentInputLine[positionTracker];
            positionTracker++;
        }
        else break;
    }
    return finalNumber;
}

var inputCount = inputProcessor.getNextInteger(),
    currentInputLine, positionTracker;

while ( inputCount-- ) {
    positionTracker = 0x0;

    currentInputLine = inputProcessor.getNextToken();
    currentInputLine = currentInputLine.slice(0, currentInputLine.length - 1);

    outputLine(evaluateExpression());
}

function createInputHandler(shouldSplitBySpace) {
    var readPointer = 0,
        tokenArray = [],
        rawData = require("fs").readFileSync("/dev/stdin", "utf8"),
        lineFragments = rawData.replace(/\r/g, '').split("\n");

    shouldSplitBySpace = shouldSplitBySpace || true;

    // Transforms input data into a flattened array by splitting on newlines and spaces.
    lineFragments.forEach(function(segment) {
        if ( shouldSplitBySpace && segment !== "" ) {
            segment.split(" ").forEach(function(element) {
                if ( element !== "" ) tokenArray.push(element);
            });
        } else {
            tokenArray.push(segment);
        }
    });

    return {
        hasMoreTokens: function(checkValue) {
            if ( typeof checkValue === "undefined" ) {
                return typeof tokenArray[readPointer] !== "undefined";
            } else {
                return tokenArray[readPointer] === checkValue;
            }
        },
        getNextToken: function() {
            if ( typeof tokenArray[readPointer + 1] === "undefined" ) throw new RangeError("Index out of bounds at '" + (readPointer + 1) + "'");
            return tokenArray[readPointer++];
        },
        getNextNumericToken: function () {
            if ( !/^\d+$/.test(this.peekToken()) ) throw new TypeError("'" + this.peekToken() + "' cannot convert to Number");
            return +this.getNextToken();
        },
        getNextInteger: function() {
            return parseInt(this.getNextNumericToken());
        },
        peekToken: function() {
            return tokenArray[readPointer];
        },
        resetPointer: function() {
            readPointer = 0;
        }
    };
}