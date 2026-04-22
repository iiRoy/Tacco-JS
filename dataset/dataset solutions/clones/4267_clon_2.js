function  arrangeDescending (  inputArray  )
{
  return  inputArray.sort( ( firstElement,  secondElement  )  =>  secondElement  <  firstElement  )  ;
}


function  processInputData ( rawDataString )
{
  const  inputLines  =  rawDataString.split( '\n' )  ;

  const  totalElementsCount  =  parseInt(  inputLines[0]  )  ;

  const  upperLayer  =  arrangeDescending(  inputLines[1].split(' ').map(  strNum  =>  parseInt(strNum,  10)  )  )  ;
  const  middleLayer  =  arrangeDescending(  inputLines[2].split(' ').map(  numericString  =>  parseInt(numericString,  10)  )  )  ;
  const  lowerLayer  =  arrangeDescending(  inputLines[3].split(' ').map(  numberText  =>  parseInt(numberText,  10)  )  )  ;

  let  validTripletsCounter  =  0  ;
  let  idx1,  idx2,  idx3  ;

  for  (  idx1  =  0  ;  idx1  <  totalElementsCount  ;  idx1++  )
  {
    for  (  idx2  =  0  ;  idx2  <  totalElementsCount  ;  idx2++  )
    {
      for  (  idx3  =  0  ;  idx3  <  totalElementsCount  ;  idx3++  )
      {
        if  (  upperLayer[idx1]  <  middleLayer[idx2]  &&  middleLayer[idx2]  <  lowerLayer[idx3]  )
        {
          validTripletsCounter  +=  1  ;
        }
      }
    }
  }

  console.log(  validTripletsCounter  )  ;
}


processInputData(  require( 'fs' ).readFileSync( '/dev/stdin',  'utf8' )  )  ;