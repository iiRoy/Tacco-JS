var sourceData = require('fs') . readFileSync(
  '/dev/stdin'
  ,
  'utf8'
)
;
var textBlocks = sourceData.split('\n') ;

while (
  currentBlock = textBlocks.shift()
)
{
    var numericStrings = currentBlock.split(' ').map(
      function ( stringPart )
      {
        return Number(stringPart) ;
      }
    )
    ;
    var valueTriplets =
    [
        + numericStrings[0] + numericStrings[1] ,
        + numericStrings[2] + numericStrings[3] ,
        + numericStrings[4] + numericStrings[5]
    ] ;
    var finalTally = 0
    ;
    for (
      var indexVal = 0 ;
      indexVal < valueTriplets.length ;
      indexVal++
    )
    {
        finalTally += Math.floor(valueTriplets[indexVal] / 3) ;
        valueTriplets[indexVal] %= 3 ;
    }
    finalTally += Math.floor(
      (
        valueTriplets[0] + valueTriplets[1] + valueTriplets[2]
      ) / 3
    ) ;
    console.log(finalTally) ;
}