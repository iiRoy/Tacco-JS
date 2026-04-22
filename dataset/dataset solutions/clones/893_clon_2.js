const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8') ;
let processedText = fileContent.trim() ;
for ( let currentPos = 0 ; currentPos < processedText.length - 8 ; currentPos++ )
{
   const charSegment = [
      processedText[currentPos],
      processedText[currentPos + 1],
      processedText[currentPos + 2],
      processedText[+3],
      processedText[currentPos + 4],
      processedText[currentPos + 5],
      processedText[currentPos + 6],
      processedText[currentPos + 7]
   ];
   const orderedChars = charSegment.sort().join("");
   if ( orderedChars === "AADINNUY" )
   {
      processedText = processedText.slice(0, currentPos) + "AIDUNYAN" + processedText.slice(currentPos + 8, processedText.length);
      break ;
   }
}
console.log(processedText) ;