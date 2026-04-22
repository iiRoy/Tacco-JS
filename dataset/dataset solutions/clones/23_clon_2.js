const fileSystemModule = require("fs");

fileSystemModule
  .readFileSync(
    "/dev/stdin",
    "utf8"
  )
  .trim()
  .split('\n')
  .some(
    function( currentInputLine )
    {
      let  lineComponents  =  currentInputLine.split(' ');

      let  firstNumericalValue  =  parseInt( lineComponents[0], 10 );
      let  secondNumericalValue  =  parseInt( lineComponents[1], 10 );

      let  originalProduct  =  firstNumericalValue  *  secondNumericalValue ;

      let  remainderResult ;

      while
      (
        ( remainderResult = firstNumericalValue % secondNumericalValue )
        !==
        0
      )
      {
        firstNumericalValue   =   secondNumericalValue ;
        secondNumericalValue  =   remainderResult ;
      }

      console.log(
        secondNumericalValue,
        originalProduct / secondNumericalValue
      );

      return false;
    }
  );