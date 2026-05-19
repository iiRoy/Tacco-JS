const readline = require('readline');

class InputHandler {
    constructor() {
        this.lines = [];
        this.currentIndex = 0;
        this.reader = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        this.reader.on('line', (inputLine) => {
            this.lines.push(inputLine);
        });

        this.reader.on('close', () => {
            this.initializeProcessor();
            console.error('\n↑入力 ↓出力');
            executeMainLogic();
        });
    }

    initializeProcessor() {
        this.processor = {
            dataList: this.lines,
            position: 0,
            maxPosition: this.lines.length,
            hasMore: function() { return (this.position < this.maxPosition); },
            retrieveNext: function() {
                if (this.hasMore()) {
                    return this.dataList[this.position++];
                } else {
                    throw 'ArrayIndexOutOfBoundsException There is no more input';
                }
            }
        };
    }

    getNextToken() { return this.processor.retrieveNext(); }
    hasMoreTokens() { return this.processor.hasMore(); }
}

const inputHandlerInstance = new InputHandler();

const CONV_PARSE_INT = 1;
const CONV_SPLIT_SPACE = 2;
const CONV_SPLIT_SPACE_PARSE_INT = 4;
const CONV_SPLIT_CHAR = 6;
const CONV_SPLIT_CHAR_PARSE_INT = 7;
const CONV_JOIN_SPACE = 8;
const CONV_JOIN_NEWLINE = 9;
const CONV_JOIN_NONE = 0;

function convertValue(inputValue, conversionType) {
    try {
        switch (conversionType) {
            case CONV_PARSE_INT: return parseInt(inputValue);
            case CONV_SPLIT_SPACE: return inputValue.split(' ');
            case CONV_SPLIT_SPACE_PARSE_INT: return inputValue.split(' ').map(Number);
            case CONV_SPLIT_CHAR: return inputValue.split('');
            case CONV_SPLIT_CHAR_PARSE_INT: return inputValue.split('').map(Number);
            case CONV_JOIN_SPACE: return inputValue.join(' ');
            case CONV_JOIN_NEWLINE: return inputValue.join('\n');
            case CONV_JOIN_NONE: return inputValue.join('');
            default: return inputValue;
        }
    } catch (e) {
        return inputValue;
    }
}

function readInteger() { return convertValue(inputHandlerInstance.getNextToken(), CONV_PARSE_INT); }
function readStringArray() { return convertValue(inputHandlerInstance.getNextToken(), CONV_SPLIT_SPACE); }
function readIntegerArray() { return convertValue(inputHandlerInstance.getNextToken(), CONV_SPLIT_SPACE_PARSE_INT); }
function readCharacterArray() { return convertValue(inputHandlerInstance.getNextToken(), CONV_SPLIT_CHAR); }
function getNextInput() { return inputHandlerInstance.getNextToken(); }
function checkHasNext() { return inputHandlerInstance.hasMoreTokens(); }

function printResult(data) { console.log(data); }
function printDebugInfo(data) { console.error('debug:' + require('util').inspect(data, false, null)); }

function createDeepCopy(sourceObject) {
    return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

function generateNineString(length) {
    return new Array(length).fill("9").join("");
}

function containsZeroDigit(num) {
    return num.toString().indexOf("0") !== -1;
}

function executeMainLogic() {
    var inputString = getNextInput();
    var substringLength = readInteger();
    var totalCount = 0;

    const MIN_K_DIGIT_NUMBER = Math.pow(10, substringLength - 1);
    const MAX_K_DIGIT_NUMBER_STR = generateNineString(substringLength);
    const MAX_K_DIGIT_NUMBER = convertValue(MAX_K_DIGIT_NUMBER_STR, CONV_PARSE_INT);

    for (var outerLoopIndex = 0; outerLoopIndex <= inputString.length - substringLength; outerLoopIndex++) {
        var currentSubstringValue;
        var currentSubstring = "";

        for (var charIndex = 0; charIndex < substringLength; charIndex++) {
            currentSubstring += inputString[outerLoopIndex + charIndex];
        }

        currentSubstringValue = convertValue(currentSubstring, CONV_PARSE_INT);

        if (outerLoopIndex !== 0) {
            currentSubstringValue = MAX_K_DIGIT_NUMBER;
        }

        for (var currentNumber = currentSubstringValue; currentNumber >= MIN_K_DIGIT_NUMBER; currentNumber--) {
            if (containsZeroDigit(currentNumber)) {
                const remainingChars = inputString.length - (outerLoopIndex + substringLength);
                const IS_SPECIAL_K3_CASE = (substringLength === 3 && currentNumber % 100 === 0);

                if (IS_SPECIAL_K3_CASE) {
                    totalCount += calculateSubproblem(remainingChars, substringLength - 1);
                } else {
                    totalCount += 9 * remainingChars;
                }
            } else {
                totalCount++;
            }
        }
    }
    printResult(totalCount);
}

function calculateSubproblem(remainingLength, subLength) {
    var nineString = generateNineString(remainingLength);
    var subCount = 0;

    const MIN_SUB_DIGIT_NUMBER = Math.pow(10, subLength - 1);
    const MAX_SUB_DIGIT_NUMBER_STR = generateNineString(subLength);
    const MAX_SUB_DIGIT_NUMBER = convertValue(MAX_SUB_DIGIT_NUMBER_STR, CONV_PARSE_INT);

    for (var outerIndex = 0; outerIndex <= nineString.length - subLength; outerIndex++) {
        var currentSubValue;
        var tempSub = "";

        for (var charIdx = 0; charIdx < subLength; charIdx++) {
            tempSub += nineString[outerIndex + charIdx];
        }

        currentSubValue = convertValue(tempSub, CONV_PARSE_INT);

        if (outerIndex !== 0) {
            currentSubValue = MAX_SUB_DIGIT_NUMBER;
        }

        for (var numVal = currentSubValue; numVal >= MIN_SUB_DIGIT_NUMBER; numVal--) {
            if (containsZeroDigit(numVal)) {
                const charsAfterSub = nineString.length - (outerIndex + subLength);
                subCount += 9 * charsAfterSub;
            } else {
                subCount++;
            }
        }
    }
    return subCount;
}

/*
function debug(N, K){
  var output = 0;
  for(var i = 1; i <= N; i++){
    var s = i.toString();
    var count = 0;
    for(var j = 0; j < s.length; j++){
      if(s[j] != 0){
        count++;
      }
    }
    if(count == K){
      output++;
    }
  }
  printResult(output);
}
*/
