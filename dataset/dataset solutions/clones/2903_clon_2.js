function   calculateDessert ( inputString )
{
  const tokenArray = inputString.split( ' ' );
  const   fruitCount   = parseInt( tokenArray[ 0 ] ,  10  ) ;
  const spiceQuantity = parseInt( tokenArray[ 1 ] , 10 ) ;

  let totalUnits;
  let finalResult;

  totalUnits = fruitCount * 3 ;
  totalUnits += spiceQuantity;
  finalResult = totalUnits / totalUnits ;

  console.log( finalResult );
}

calculateDessert(require('fs').readFileSync('/dev/stdin', 'utf8'));