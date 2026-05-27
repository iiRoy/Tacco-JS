//Don't have to see. start------------------------------------------
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
//param "no" is
//unknown or outlier : return i. 1: parseInt.
//2: split space. 4: split space and parseInt.
//6: split 1 character. 7: split 1 character and parseInt.
//8: join space. 9: join nextline. 0: join no character.
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}

//Don't have to see. end------------------------------------------
function Main(){
  var structureDepth = nextInt();
  var numericSequence = nextIntArray();

  // Sort the entire input sequence in descending order once.
  // This allows direct comparison of elements based on their overall rank.
  numericSequence.sort((valA, valB) => valB - valA);

  // The problem implies a hierarchical structure where elements at a higher level
  // must be strictly greater than their corresponding elements at the next lower level.
  // The structure involves 1 root element, then 1 child, then 2 children, then 4, etc.
  // For a given 'level' (from 0 to structureDepth-1), we compare a set of '2^level'
  // "parent" elements with a set of '2^level' "child" elements.
  // In the fully sorted descending array, the first '2^level' elements represent
  // the combined "parents" from all previous levels, and the next '2^level' elements
  // represent the "children" for the current level.

  for (let currentLevel = 0; currentLevel < structureDepth; currentLevel++) {
    const currentLevelElementCount = 1 << currentLevel; // Number of elements in the 'parent' group for this comparison
    const parentGroupOffset = 0; // The 'parent' group always starts from the beginning of the sorted array
    const childGroupOffset = currentLevelElementCount; // The 'child' group starts immediately after the 'parent' group

    for (let elementRank = 0; elementRank < currentLevelElementCount; elementRank++) {
      const parentCandidate = numericSequence[parentGroupOffset + elementRank];
      const childCandidate = numericSequence[childGroupOffset + elementRank];

      // If any parent element is not strictly greater than its corresponding child element,
      // the condition is violated.
      if (parentCandidate <= childCandidate) {
        myout("No");
        return;
      }
    }
  }

  // If all hierarchical comparisons pass for all levels, the condition is met.
  myout("Yes");
}
