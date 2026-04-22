let dataSource = require('fs').readFileSync('/dev/stdin','utf8');
let processedText = ( dataSource.trim() ) . replace(/gg|hicken/g, "");
while( /ee/.test(processedText) ) processedText = processedText.replace(/ee/g,"eAe");
while ( /cc/.test(processedText) ) processedText = processedText.replace(/cc/g,"cAc");
const segmentList=processedText.split("A");
let finalResult = "";
segmentList . forEach ( function ( currentSegment ) {
  if ( finalResult . length < currentSegment . length ) {
    finalResult = currentSegment;
  }
} ) ;
console.log( ( finalResult . slice ( -1 ) == "e" ) ? "egg" : "chicken" );