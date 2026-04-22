function normalizeValue( valIn )
{
   if( valIn >= 10 )
     valIn = valIn - 10 + 1;
   return valIn ;
}

var dataSourceContent = require('fs') . readFileSync( '/dev/stdin' , 'utf8' ) ;
var linesArray = dataSourceContent. trim() . split("\n");
var totalItemsCount = linesArray. shift() - 0 ;
var indicatorSequence = linesArray . shift(). split("");
var someNumericValue = linesArray.shift() - 0;
var dataPointsArray = linesArray.shift().split(" ").map(parseFloat);
var coefficientFactors = [];
var initialAccumulator = 0;

indicatorSequence.forEach(
    function( currentIndicator, indexPos )
    {
        if( currentIndicator == "*" )
        {
            if( indexPos % 2 == 0 )
                coefficientFactors.push( 1 ) ;
            else
                coefficientFactors.push( 2 ) ;
        }
        else
        {
            if( indexPos % 2 == 0 )
                initialAccumulator += currentIndicator - 0 ;
            else
                initialAccumulator += normalizeValue( ( currentIndicator - 0 ) * 2 ) ;
        }
    }
);

var dynamicProgrammingTable = [];
for( var rowIdx = 0 ; rowIdx <= 7 ; rowIdx ++ )
{
    dynamicProgrammingTable[ rowIdx ] = [] ;
    for( var colIdx = 0 ; colIdx <= 1000000 ; colIdx ++ )
        dynamicProgrammingTable[ rowIdx ][ colIdx ] = 0 ;
}
 
dynamicProgrammingTable[ 0 ][ initialAccumulator ] = 1 ;
 
for( var stepIdx = 0 ; stepIdx < coefficientFactors.length ; stepIdx ++ )
{
    for( var dataPointIdx = 0 ; dataPointIdx < dataPointsArray.length ; dataPointIdx ++ )
    {
        for( var currentSumValue = 0 ; currentSumValue <= 1000000 ; currentSumValue ++ )
        {
            dynamicProgrammingTable[ stepIdx + 1 ][ currentSumValue + normalizeValue( dataPointsArray[ dataPointIdx ] * coefficientFactors[ stepIdx ] ) ]
                += dynamicProgrammingTable[ stepIdx ][ currentSumValue ] ;
        }
    }
 
}
var finalResult = 0 ;
for( var finalSumCheck = 0 ; finalSumCheck <= 1000000 ; finalSumCheck ++ )
{
    if( finalSumCheck % 10 == 0 )
        finalResult += dynamicProgrammingTable[ coefficientFactors.length ][ finalSumCheck ] ;
}
console.log( finalResult ) ;