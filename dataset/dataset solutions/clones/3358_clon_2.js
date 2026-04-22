"use strict";

const   processInputData  =  ( rawInputText )  =>
{
  const valOne =  parseInt( rawInputText.split(" ")[0] );
  const valTwo =  parseInt( rawInputText.split(" ")[1] );
  const valThree =  parseInt( rawInputText.split(" ")[2] );

  let totalResult = 0;

  if  ( valTwo  >=  valThree )
  {
    totalResult  +=  valThree  +  valTwo;
    valThree  =  0;
  }
  else
  {
    totalResult  +=  valTwo  *  2;
    valThree  -=  valTwo, valTwo  =  0;
  }

  if  ( valThree  >  0 )
  {
    var intermediateAmount =  Math.min( valThree, valOne );
    valThree  -=  intermediateAmount;
    totalResult  +=  intermediateAmount;
  }


  if  ( valThree  >  0 )
    totalResult++;

  console.log( totalResult );
}
;

processInputData(  require('fs').readFileSync(  '/dev/stdin',  'utf8'  )  );