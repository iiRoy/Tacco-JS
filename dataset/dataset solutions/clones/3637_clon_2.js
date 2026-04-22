'use strict';

function  executeProgram(  inputString  )
{
  // This function processes an input string to validate its structure.

  if  (  inputString[ 0 ]  !==  "A"  )
  {
    console.log(  'WA'  );
    return;
  }

  let  charCCount  =  0;

  for  (  let  currentIndex  =  1;  currentIndex  <  inputString.length;  currentIndex++  )
  {
    if  (  currentIndex  >=  2  &&  currentIndex  <=  inputString.length  -  2  &&  inputString[ currentIndex ]  ===  "C"  )
    {
      charCCount++;
      if  (  charCCount  >  1  )
      {
        console.log(  "WA"  );
        return  0;
      }
    }
    else  if  (  inputString[ currentIndex ].search(  /[a-z]/  )  ===  -1  )
    {
      console.log(  "WA"  );
      return  0;
    }
  }

  if  (  charCCount  !==  1  )
  {
    console.log(  "WA"  );
  }
  else
  {
    console.log(  'AC'  );
  }
}

executeProgram(  require('fs').readFileSync(  '/dev/stdin',  'utf8'  )  );