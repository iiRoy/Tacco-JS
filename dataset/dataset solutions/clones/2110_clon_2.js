// Incoming data stream contains all necessary values
function ProcessInput ( rawData )
{

  rawData = rawData . split ( "\n" ) ;

  let firstValue = Number . parseInt ( rawData [ 0 ] , 10 ) ;

  console . log ( '%d' , ( firstValue + 1 ) / 2 ) ;
}

// Do not modify anything below this point (handles standard I/O and invokes the primary processing function).
ProcessInput ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;