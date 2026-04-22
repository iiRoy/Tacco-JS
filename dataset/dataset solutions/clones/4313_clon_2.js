function extractSegment( inputBundle )
{
  var currentSegmentValue;
  for ( var charIndex = 0; charIndex < inputBundle[0].length; charIndex++ )
  {
    if ( "\n" === inputBundle[0].charAt( charIndex ) ) {
      currentSegmentValue = inputBundle[0].slice( 0, charIndex );
      inputBundle[0] = inputBundle[0].slice( currentSegmentValue.length + 1 );
      return currentSegmentValue;
    }
  }
  currentSegmentValue = inputBundle[0];
  inputBundle[0] = "";
  return currentSegmentValue;
}
function ProcessInputData( rawInputString )
{
  rawInputString = [ rawInputString ];
  var targetValueDenom = extractSegment( rawInputString );
  targetValueDenom = parseInt( targetValueDenom );
  locateValueRecursively( 0.0002857959416976279, 3500, 1750 );
  var requiredFraction = 4.0 / targetValueDenom;
  var temporaryCalculation;
  for ( var denomH = 1; denomH <= 3500; denomH++ )
  {
    if ( requiredFraction <= 1.0 / denomH )
      continue;
    for ( var denomN = 1; denomN <= 3500; denomN++ )
    {
      temporaryCalculation = 1.0 / denomH + 1.0 / denomN;
      if ( requiredFraction <= temporaryCalculation )
        continue;
      temporaryCalculation = locateValueRecursively( requiredFraction - temporaryCalculation, 3500, 1750 );
      if ( -1 === temporaryCalculation )
        continue;
      if ( verifyEquation( requiredFraction, denomH, denomN, temporaryCalculation ) )
        return;
    }
  }
  console.log( "NO_SOLUTION" );
  function locateValueRecursively( intendedResult, currentDenominator, searchStep )
  {
    var computedFractional;
    var adjustmentDirection = 0;
    while ( 0 !== searchStep )
    {
      computedFractional = 1.0 / currentDenominator;
      if ( intendedResult === computedFractional )
      {
        return currentDenominator;
      }
      else if ( intendedResult < computedFractional )
      {
        currentDenominator += searchStep;
        if ( 1 === searchStep && 0 === adjustmentDirection )
          adjustmentDirection = 1;
        if ( -1 === adjustmentDirection )
          return -1;
        if ( currentDenominator > 3500 )
          return -1;
      }
      else
      {
        currentDenominator -= searchStep;
        if ( 1 === searchStep && 0 === adjustmentDirection )
          adjustmentDirection = -1;
        if ( 1 === adjustmentDirection )
          return -1;
        if ( currentDenominator < 1 )
          return -1;
      }
      searchStep = Math.floor( searchStep / 2 );
      if ( 0 === searchStep )
        searchStep = 1;
    }
    return -1;
  }
  function verifyEquation( targetTotal, firstVal, secondVal, thirdVal )
  {
    if ( targetTotal === ( 1.0 / firstVal + 1.0 / secondVal + 1.0 / thirdVal ) )
    {
      console.log( [ firstVal, secondVal, thirdVal ].join(" ") );
      return true;
    }
    return false;
  }
  function hasItem( elementList, itemToFind )
  {
    for ( var iterator = 0; iterator < elementList.length; iterator++ )
    {
      if ( elementList[iterator] === itemToFind )
        return true;
    }
    return false;
  }
}
ProcessInputData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );