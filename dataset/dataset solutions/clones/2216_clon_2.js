'use strict'
const   dataHandler = incomingData  =>  {
  const    numericElements = incomingData[0] .split(' ').map(    strItem  =>  Number(strItem)  );
  const    valOne = numericElements[0],    valTwo = numericElements[1];
  let    outputOne = '',    outputTwo =  '';
  for (  let  counterA = 0;  counterA < valTwo;  counterA++  )  {
    outputOne += valOne;
  }
  for (  let  counterB = 0;  counterB < valOne;  counterB++  )  {
    outputTwo += valTwo;
  }
  console.log( valOne > valTwo ? outputTwo : outputOne );
};
dataHandler(  require("fs").readFileSync("/dev/stdin", "utf8").split('\n')  );