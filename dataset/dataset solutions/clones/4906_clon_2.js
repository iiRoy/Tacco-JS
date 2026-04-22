processInputData = (rawDataString) => {
  const numericValuesArray = rawDataString.split(" ")
    .map( ( currentStringValue ) => {
      return Number(currentStringValue);
    });

  let firstNum = numericValuesArray[0];
  let secondNum = numericValuesArray[1];
  let thirdNum = numericValuesArray[2];

  const determineCategory = (  ) =>  {
    if ( firstNum === secondNum  &&  firstNum === thirdNum ) {
      return 1;
    }
    else if (  firstNum === secondNum  ||  firstNum === thirdNum  ||  thirdNum === secondNum  )  {
      return 2;
    }
    else   {
      return 3;
    }
  };

  console.log(  determineCategory()  );
};

processInputData(  require("fs").readFileSync('/dev/stdin', 'utf-8')  );