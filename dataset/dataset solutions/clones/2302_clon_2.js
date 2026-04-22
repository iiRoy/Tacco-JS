function ProcessGameData(  rawDataString )
{
    rawDataString = rawDataString .trim( );

    rawDataString = rawDataString.slice();

    rawDataString = rawDataString.split( "\n" );

    rawDataString = rawDataString.map(  lineItem  =>  lineItem .split(" ")  );


    var numericRules = rawDataString[0].map(  elemStr  =>  parseInt(elemStr) );

    var scoreMappings = rawDataString[1].map(  valStr  =>  parseInt(valStr) );

    var moveSequence = rawDataString[2][0].split( "" );


    var initialPointArray = moveSequence.map(  characterMove  =>
    {
        if (  characterMove == "r"  )
        {
            return scoreMappings[2];
        }
        else if ( characterMove  ==  "s" )
        {
            return scoreMappings[0];
        }
        else
        {
            return scoreMappings[1];
        }
    } );


    initialPointArray.forEach(  ( currentPointValue, currentIndex, pointListReference )  =>
    {
        if (  currentPointValue  ==  pointListReference[currentIndex + numericRules[1]]  )
        {
            initialPointArray[  currentIndex  +  numericRules[1]  ]  =  0;
        }
    } );

    var calculatedTotal = initialPointArray.reduce(  ( previousSum, itemScore )  =>  previousSum  +  itemScore,  0  );

    console.log(calculatedTotal);
}


ProcessGameData( require("fs").readFileSync("/dev/stdin", "utf8") );