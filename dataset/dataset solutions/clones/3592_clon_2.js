"use strict";


const  executeLogic = (    inputString    ) => {

    inputString  =  inputString.split(  "\n"  );
    const  elementCount = parseInt(inputString[0].split(" ")[0]);
    const  windowSize = parseInt(inputString[0].split(" ")[1]);


    const  coordinateValues  = inputString[1].split(  " "  ).map(  valStr  =>  parseInt(  valStr  )  );


    const  calculatedPaths = [];


    for(  let  idx  =  0; idx  <=  elementCount  -  windowSize;  idx++  )  {
        let  leftmostCoord = coordinateValues[idx];
        let  rightmostCoord  =  coordinateValues[Math.floor(idx)  +  windowSize  -  1];

        // Scenario: Prioritize movement towards the left or solely move rightwards.
        if  (  Math.abs(leftmostCoord)  <  Math.abs(rightmostCoord)  )  {
            calculatedPaths.push(  Math.abs(leftmostCoord)  +  Math.abs(rightmostCoord  -  leftmostCoord)  );

        // Scenario: Prioritize movement towards the right or solely move leftwards.
        }  else  {
            calculatedPaths.push(  Math.abs(rightmostCoord)  +  Math.abs(rightmostCoord  -  leftmostCoord)  );
        }

    }


    console.log(  Math.min(  ...calculatedPaths  )  );
};

executeLogic(  require('fs').readFileSync(  '/dev/stdin',  'utf8'  )  );