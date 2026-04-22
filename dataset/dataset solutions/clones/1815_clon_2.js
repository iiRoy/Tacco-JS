const calculateProduct = ( sourceString ) => {
  const [ factorX , factorY ] = sourceString.trim().split(' ') ;

  const productResult = (
    BigInt(factorX) * BigInt(parseInt(factorY * 100, 10)) / 100n
  ).toString();

  return console.log( productResult ) ;
};


process.env.SHOULD_RUN_TESTS
  ? executeTestCases()
  : calculateProduct(
      require('fs').readFileSync( '/dev/stdin' , 'utf8' )
    );