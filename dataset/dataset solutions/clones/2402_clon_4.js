var read = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var obj; var inLine = [];
read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
  obj = init(inLine);
  console.error('\n');
  var start = Date.now();
  processGame();
  var end = Date.now() - start;
  myerr('time : ' + end + 'ms');
  myerr('memory : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});

class InputIterator {
    constructor(inputLines) {
        this.lines = inputLines;
        this.currentIdx = 0;
    }

    hasNext() {
        return this.currentIdx < this.lines.length;
    }

    next() {
        if (this.hasNext()) {
            return this.lines[this.currentIdx++];
        } else {
            throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
        }
    }
}
function init(input) {
    return new InputIterator(input);
}

function makeClone(obj){return (obj instanceof Set) ? new Set(Array.from(obj)) : JSON.parse(JSON.stringify(obj));}
function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
function next(){return obj.next();} function hasNext(){return obj.hasNext();}
function myout(s){console.log(s);}
function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}

const conversionHandlers = new Map([
    [1, (val) => parseInt(val)],
    [2, (val) => val.split(' ')],
    [4, (val) => val.split(' ').map(Number)],
    [6, (val) => val.split('')],
    [7, (val) => val.split('').map(Number)],
    [8, (val) => val.join(' ')],
    [9, (val) => val.join('\n')],
    [0, (val) => val.join('')]
]);

function myconv(inputVal, conversionType) {
    try {
        const handler = conversionHandlers.get(conversionType);
        return handler ? handler(inputVal) : inputVal;
    } catch (error) {
        return inputVal;
    }
}

function processGame() {
    const initialConfig = nextIntArray();
    const startPoint = initialConfig[0];
    const maxStep = initialConfig[1];
    const pathString = next();

    const determinePath = (currentPos, currentJumps) => {
        myerr(currentPos);

        if (currentPos === 0) {
            return currentJumps;
        }

        const possibleJumpLengths = Array.from({ length: maxStep }, (_, k) => k + 1);

        const validTargetPositions = possibleJumpLengths.filter(len => {
            const target = currentPos - len;
            return target >= 0 && pathString[target] === '0';
        });

        if (validTargetPositions.length === 0) {
            return null;
        }

        const chosenJump = validTargetPositions[validTargetPositions.length - 1];

        return determinePath(currentPos - chosenJump, [...currentJumps, chosenJump]);
    };

    const resultSequence = determinePath(startPoint, []);

    if (resultSequence === null) {
        myout(-1);
    } else {
        resultSequence.reverse();
        myout(myconv(resultSequence, 8));
    }
}
