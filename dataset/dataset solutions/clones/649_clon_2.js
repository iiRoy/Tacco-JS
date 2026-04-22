const getFileData = (pathName, charSet) =>  require('fs').readFileSync(pathName, charSet)  ;

const splitString =  (inputStr, separatorChar)  => inputStr.split(separatorChar)  ;

const convertValuesToNumbers = (arrItems) =>  arrItems.map(parseFloat)  ;

const displayMessage =  (messageContent)  => console.log(messageContent)  ;


let  [ startValue ,  extraBonus ,  targetThreshold ]  =  convertValuesToNumbers ( splitString ( getFileData ( '/dev/stdin' ,  'utf8' ) ,  ' ' ) ) ;


let  currentTally  =  0 ;

let  dayCounter  =  1 ;


if  ( startValue  >=  targetThreshold )  {
  displayMessage ( 1 ) ;
}  else  {
  while  ( currentTally  <=  targetThreshold )  {
    currentTally  +=  startValue ;

    if  ( dayCounter  %  7  ===  0 )  {
      currentTally  +=  extraBonus ;
    }

    if  ( targetThreshold  ===  currentTally  ||  targetThreshold  <  currentTally )  {
      displayMessage ( dayCounter ) ;
      break ;
    }  else  if  ( targetThreshold  -  currentTally  <  startValue )  {
      displayMessage ( dayCounter  +  1 ) ;
      break ;
    }

    dayCounter ++ ;
  }
}