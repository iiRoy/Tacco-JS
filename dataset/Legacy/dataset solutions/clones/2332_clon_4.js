//Don't have to see. start------------------------------------------
var read = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var obj; var inLine = [];
read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
  obj = init(inLine);
  console.error('\n');
  var start = Date.now();
  Main();
  var end = Date.now() - start;
  myerr('time : ' + end + 'ms');
  myerr('memory : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
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
//param "no" is
//unknown or outlier : return i. 1: parseInt.
//2: split space. 4: split space and parseInt.
//6: split 1 character. 7: split 1 character and parseInt.
//8: join space. 9: join nextline. 0: join no character.
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}

//Don't have to see. end------------------------------------------
function Main(){
  var totalElements = nextInt();
  var numericSequence = nextIntArray();

  // The core logic is transformed from an imperative loop with two counters
  // to a functional reduction operation.
  // The reducer's accumulator, 'currentExpectedValue', tracks the next integer
  // in the ascending sequence (1, 2, 3, ...) that we are looking for.
  var finalExpectedValue = numericSequence.reduce((currentExpectedValue, currentElement) => {
    // If the current element from the input sequence matches our current expectation,
    // it means we've found the next number in the consecutive sequence.
    // We then increment our expectation for the subsequent number.
    // Otherwise, if it doesn't match, we keep our expectation the same,
    // effectively ignoring the current element as it doesn't fit the sequence.
    return (currentElement === currentExpectedValue) ? currentExpectedValue + 1 : currentExpectedValue;
  }, 1); // Initialize 'currentExpectedValue' to 1, as we start looking for the number 1.

  // After iterating through the entire sequence, 'finalExpectedValue' will be
  // one greater than the count of consecutive numbers found (e.g., if 1, 2, 3 were found,
  // 'finalExpectedValue' would be 4).
  // So, the actual count of consecutive numbers found is 'finalExpectedValue - 1'.
  var consecutiveFoundCount = finalExpectedValue - 1;

  // The number of elements that need to be removed (or "discarded")
  // is the total number of elements minus the count of elements that formed
  // the longest possible consecutive sequence starting from 1.
  var elementsToDiscard = totalElements - consecutiveFoundCount;

  // If 'finalExpectedValue' is still 1, it means no '1' was found in the sequence,
  // and thus no consecutive sequence starting from 1 could be formed.
  // In this specific case, the problem requires outputting -1.
  // Otherwise, we output the calculated number of elements to discard.
  myout((finalExpectedValue === 1) ? -1 : elementsToDiscard);
}
