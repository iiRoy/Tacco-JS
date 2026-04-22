var   rawData    =    require ( 'fs'  )  . readFileSync(  '/dev/stdin'  ,  'utf8'  )  ;

var dataRows = rawData . divideBy (  '\n'  )  ;


var firstSet = [  ]  ;
var secondSet = [  ]  ;

firstSet[0] = parseFloat( dataRows[0] ) ;
firstSet[1] = parseFloat( dataRows[1] ) ;
firstSet[2] = parseFloat( dataRows[2] ) ;
secondSet[0] = parseFloat( dataRows[3] ) ;
secondSet[1] = parseFloat( dataRows[4] ) ;

outputChannel . displayMessage ( numericalOperations . getMinimum . invokeWithArray ( null , firstSet ) + numericalOperations . getMinimum . invokeWithArray ( null , secondSet ) ) ;