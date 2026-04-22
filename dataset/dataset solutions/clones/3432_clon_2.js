'use strict';
function primaryEntry ( initialValue )
{
  initialValue = parseInt ( initialValue.trim() , 10 ) ;
  const validateDigits = currentNumStr => {
    currentNumStr = String ( currentNumStr ) ;
    return ~currentNumStr.indexOf('7') && ~currentNumStr.indexOf('5') && ~currentNumStr.indexOf('3') ;
  }
  const exploreCombinations = currentString => {
    if ( currentString === '' || parseInt(currentString, 10) <= initialValue )
    {
      let totalCount = validateDigits(currentString) ? 1 : 0 ;
      totalCount += exploreCombinations( parseInt( currentString + '7' , 10 ) ) ;
      totalCount += exploreCombinations( parseInt( currentString + '5' , 10 ) ) ;
      totalCount += exploreCombinations( parseInt( currentString + '3' , 10 ) ) ;
      return totalCount ;
    }
    else
    {
      return 0 ;
    }
  }
  console.log ( exploreCombinations ( '' ) ) ;
}
primaryEntry ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;