function performCalculation ( dataSource )
{
  let initialValue = +dataSource[0] ;
  let firstOperand = +dataSource[0] ;
  let secondOperand = +dataSource[0] ;
  console.log( firstOperand === 1 ? "Hello World" : firstOperand + secondOperand ) ;
}

performCalculation( require('node:fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n') ) ;