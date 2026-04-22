var rawData=require('fs').readFileSync('/dev/stdin','utf8');
var inputLines=rawData.split('\n');

var letterOccurrenceCounts=[];
for (var lineIndex=0;lineIndex<inputLines.length;lineIndex++) {
  var currentLineContent=inputLines.shift();
  var charArray=currentLineContent.split('');
  charArray.forEach(function(singleChar){
    var lowerCaseChar=singleChar.toLowerCase();
    if(lowerCaseChar<'a'||lowerCaseChar>'z')
      return;

    var alphabetPosition=lowerCaseChar.charCodeAt(0)-'a'.charCodeAt(0);
    letterOccurrenceCounts[alphabetPosition]|=0;
    letterOccurrenceCounts[alphabetPosition]++;
  });
}

var asciiA='a'.charCodeAt(0);
for(var alphabetIterator=0;alphabetIterator<26;alphabetIterator++){
  var displayChar=String.fromCharCode(asciiA+alphabetIterator);
  var totalCount=letterOccurrenceCounts[alphabetIterator]||0;
  console.log(displayChar+' : '+totalCount);
}