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
  const structureDepth = nextInt();
  const inputNumbers = nextIntArray();

  inputNumbers.sort((firstVal, secondVal) => firstVal - secondVal);

  const totalRequiredElements = (1 << (structureDepth + 1)) - 1;

  const finalResult = Array.from({ length: structureDepth }, (_, currentLevelIndex) => currentLevelIndex + 1)
    .every(levelIteration => {
      const elementsToExtractForLevel = (1 << levelIteration);
      const comparisonsPerLevel = elementsToExtractForLevel - 1;

      return Array.from({ length: comparisonsPerLevel }, (_, comparisonOffset) => comparisonOffset)
        .every(offset => {
          const upperElementAbsoluteIndex = totalRequiredElements - 1 - offset;
          const lowerElementAbsoluteIndex = totalRequiredElements - elementsToExtractForLevel - offset;

          const upperElementValue = inputNumbers[upperElementAbsoluteIndex];
          const lowerElementValue = inputNumbers[lowerElementAbsoluteIndex];

          // The original code's comparison 'check[j] <= check2[j]'
          // evaluates to 'false' if either operand is 'undefined'.
          // This means an 'undefined' value does NOT trigger the "NO" condition.
          // To replicate this, if we encounter 'undefined', we consider this specific
          // comparison as passing (returning true for 'every').
          if (upperElementValue === undefined || lowerElementValue === undefined) {
            return true;
          }

          // For actual number comparisons, the original code outputs "NO" if
          // 'check[j] <= check2[j]' is true.
          // Therefore, for the "YES" path, we need 'upperElementValue > lowerElementValue'.
          return upperElementValue > lowerElementValue;
        });
    });

  myout(finalResult ? "YES" : "NO");
}
