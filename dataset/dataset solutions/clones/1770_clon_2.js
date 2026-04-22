/*
 * This program evaluates a specific numerical condition.
 * It processes two integer values extracted from a string input.
 */
function  executeCoreLogic  (  payloadString  )
{
  payloadString =   payloadString .  trim ( ) ;

  let  animalCount  =  parseInt ( payloadString . split ( " " ) [ 0 ] ) ;
  let  totalLegs    =  parseInt ( payloadString . split ( " " ) [ 1 ] ) ;

  const  isFeasible  =  ( ( animalCount * 2 <= totalLegs )  &&  ( animalCount * 4 >= totalLegs ) ) ;

  if  ( isFeasible === true )
  {
    console . log ( "Yes" ) ;
  }
  else
  {
    console . log ( "No" ) ;
  }
}

executeCoreLogic ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;