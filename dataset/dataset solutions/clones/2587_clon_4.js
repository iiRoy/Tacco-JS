var read = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var obj; var inLine = [];
read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
  obj = init(inLine);
  console.error('\n↑入力 ↓出力');
  Main();
});
function makeClone(obj){return (obj instanceof Set) ? new Set(Array.from(obj)) : JSON.parse(JSON.stringify(obj));}
function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
function next(){return obj.next();} function hasNext(){return obj.hasNext();}
function init(input){  
  return {
    list : input, index : 0, max : input.length,
    hasNext : function(){return (this.index < this.max);},
    next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
  };
}
function myout(s){console.log(s);}
function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}

function Main() {
  const pyramidDepth = nextInt();
  const initialNumbers = nextIntArray();

  // Sort in descending order to easily retrieve the largest elements sequentially
  const orderedNumbers = initialNumbers.sort((first, second) => second - first);

  let dataPointer = 0; // Pointer to the next element in orderedNumbers
  let accumulatedPyramidValues = []; // Stores all elements processed so far, in flattened level order

  // Handle the root element (Level 0)
  // If orderedNumbers is empty, orderedNumbers[0] will be undefined, matching original's list.pop() behavior
  accumulatedPyramidValues.push(orderedNumbers[dataPointer++]);

  // Process subsequent levels (from 1 to pyramidDepth) using Array.prototype.every for functional style
  // This replaces the main 'for' loop (for var i = 1; i <= N; i++)
  const allLevelsValid = Array.from({ length: pyramidDepth }, (_, levelIndex) => levelIndex + 1)
    .every(currentLevelNumber => {
      const elementsForThisLevel = 1 << currentLevelNumber; // Calculate 2^currentLevelNumber
      const nextLevelElements = [];

      // Populate elements for the current level
      // This replaces the inner 'for' loop (for var j = 0; j < (1 << i); j++) and list.pop()
      for (let k = 0; k < elementsForThisLevel; k++) {
        // If orderedNumbers is exhausted, push undefined to mimic original's list.pop() returning undefined
        const nextValue = (dataPointer < orderedNumbers.length) ? orderedNumbers[dataPointer++] : undefined;
        nextLevelElements.push(nextValue);
      }

      // Perform the comparison: each element in the accumulated list from previous levels
      // must be strictly greater than the corresponding element in the current level.
      // This replaces the comparison 'for' loop (for var j = 0; j < check2.length; j++)
      // and handles the original's implicit behavior where `undefined <= number` is false.
      const levelComparisonValid = accumulatedPyramidValues.every((parentValue, idx) => {
        // `parentValue` can be undefined if previous levels ran out of numbers.
        // `nextLevelElements[idx]` can be undefined if current level ran out of numbers.
        // In JavaScript, `undefined <= number` is `false`, `number <= undefined` is `false`,
        // and `undefined <= undefined` is `false`.
        // Thus, `parentValue > nextLevelElements[idx]` will only be false if both are numbers
        // AND `parentValue <= nextLevelElements[idx]`. This precisely matches the original's logic.
        return parentValue > nextLevelElements[idx];
      });

      if (!levelComparisonValid) {
        return false; // A comparison failed, so the entire pyramid structure is invalid.
      }

      // Update the accumulated list for the next iteration.
      // Using spread syntax for concatenation is a different implementation than Array.prototype.concat.
      accumulatedPyramidValues.push(...nextLevelElements);
      return true; // This level is valid, continue to the next.
    });

  if (allLevelsValid) {
    myout("Yes");
  } else {
    myout("No");
  }
}
