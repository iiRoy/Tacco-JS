const   sourceText  =   require('fs')   .readFileSync   ('/dev/stdin',  'utf8')    .trim  ();
const   textLines   =   sourceText  .split  ('\n')  ;

for  ( let  rowIdx =  0 ;  rowIdx <  textLines.length ;   rowIdx++  )
{
    targetNumber =  Number( textLines[rowIdx] ) ;
    if  ( targetNumber !==  0 )
    {
        let minimumTotal  = targetNumber;
        let maxZCoord = Math.floor( Math.cbrt( targetNumber ) ) ;
        for  ( let  zIterValue  = 0;  zIterValue <= maxZCoord;  zIterValue++ )
        {
            let maxYCoord = Math.floor( Math.sqrt( targetNumber - zIterValue * zIterValue * zIterValue ) ) ;
            for  ( let  yIterValue = 0 ;  yIterValue <= maxYCoord ;  yIterValue++  )
            {
                xCalculated = targetNumber - zIterValue * zIterValue * zIterValue - yIterValue * yIterValue ;
                if  ( xCalculated + yIterValue + zIterValue < minimumTotal )  {
                    minimumTotal = xCalculated + yIterValue + zIterValue ;
                }
            }
        }
        console.log( minimumTotal ) ;
    }
}