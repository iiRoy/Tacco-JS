'use strict'; 

function CoreLogic(    rawData   )
{
  const    sourceData   =   rawData.   trim ( ) .split (   / \r ? \n / g   ) ;
  const    parameters   =   sourceData[   0   ] .split (   ' '   ) .map (   (   itemStr   )   =>   Number (   itemStr   )   ) ;
  const    mainDimension   =   parameters[   0   ],    iterationCount   =   parameters[   1   ] ;
  let    valueSet   =   sourceData[   1   ] .split (   ' '   ) .map (   (   textVal   )   =>   Number (   textVal   )   ) ;
  let    rangeEnd   =   0,    rangeStart   =   0 ;
  let    outputArray   =   new    Array (   mainDimension   ) ;

  for   (   let    outerLoopIdx   =   0 ;    outerLoopIdx   <   iterationCount ;    outerLoopIdx ++   )   {
    outputArray.   fill (   0   ) ;
      for   (   let    elementIndex   =   0 ;    elementIndex   <   mainDimension ;    elementIndex ++   )   {
        rangeEnd   =   (   elementIndex   +   valueSet[   elementIndex   ]   )   >   mainDimension   ?   mainDimension   -   1   :   elementIndex   +   valueSet[   elementIndex   ] ;
        rangeStart   =   (   elementIndex   -   valueSet[   elementIndex   ]   )   <   1   ?   0   :   elementIndex   -   valueSet[   elementIndex   ] ;
          for   (   let    fillIndex   =   rangeStart ;    fillIndex   <=   rangeEnd ;    fillIndex ++   )   {
            outputArray[   fillIndex   ]   +=   1 ;
          }
      }
    valueSet   =   outputArray.   slice (   0   ) ;
  }
  console.log (   outputArray.   join (   ' '   )   ) ;
}

// Invoke the primary processing function with file system input.
CoreLogic( require (   "fs"   ) .readFileSync (   "/dev/stdin"  ,   "utf8"   ) ) ;