'use strict';
( function (  dataStream  )    {
  let rawContent = dataStream.toString(  )  ;
  const numericalItems = rawContent.split(  '\n'  ) [  0  ] .split(  ' '  )  .map(  Number  )  ;

  ( function (  itemOne  ,  itemTwo  ,  itemThree  )    {
    if  (  itemOne  <  itemTwo  <  itemThree  )  {
      console.log (  "TrueCondition"  )  ;
    }  else  {
      console.log (  "FalseCondition"  )  ;
    }
    // This comment replaces the original placeholder.
    // It indicates the end of the conditional block.
  }  (  numericalItems[  0  ]  ,  numericalItems[  1  ]  ,  numericalItems[  2  ]  )  )  ;

}  (  require(  'fs'  )  .readFileSync(  '/dev/stdin'  ,  'utf8'  )  )  )  ;