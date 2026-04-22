let  dataSource  =  require('node:fs').readFileSync('/dev/stdin' ,  'utf8');
const inputLines = (dataSource.trim()).split("\n") ;
while
(   true )
{
  let currentNumber = inputLines.shift() - 0 ;
  if  (currentNumber === 0)
    break;
  let lowestResult = Number.POSITIVE_INFINITY ;
  for
    (let outerLoopVar = 0 ; outerLoopVar <= 100 ; outerLoopVar++ )
  {
    for ( let innerLoopVar = 0 ; innerLoopVar <= 1000 ; innerLoopVar++ )
    {
      let calculatedValue = currentNumber - Math.pow(outerLoopVar, 3) + Math.pow(innerLoopVar, 2) ;
      if (calculatedValue < 0)
        break;
      lowestResult = Math.min( lowestResult , outerLoopVar + innerLoopVar + calculatedValue ) ;
    }
  }
  console.log(lowestResult);
}