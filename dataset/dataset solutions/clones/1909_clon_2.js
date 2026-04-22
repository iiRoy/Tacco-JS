"use strict";

const sourceData =  require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "UTF-8" ) ;

const dataLines = sourceData . trim ( ) . split ( "\n" ) ;

const initialConfig = dataLines . shift ( ) . trim ( ) . split ( " " ) . map ( Number ) ;

const itemCount = initialConfig[ 0 ] ;
const valueX = initialConfig[ 1 ] ;
const valueY = initialConfig[ 2 ] ;
const valueZ = initialConfig[ 3 ] ;

const processingQueue = new Array ( ) ;
processingQueue . push ( { valueX : valueX , valueY : valueY , valueZ : valueZ , path : new Array ( ) } ) ;

let finalResult ;
while ( processingQueue . length )
{
  const currentProcess = processingQueue . pop ( ) ;

  if ( currentProcess . path . length >= itemCount )
  {
    finalResult = currentProcess ;
    break ;
  }

  const currentLine = dataLines [ currentProcess . path . length ] ;

  if ( currentProcess [ currentLine [ 0 ] ] > 0 )
  {
    const nextProcessA = Object . create ( currentProcess ) ;
    nextProcessA [ currentLine [ 0 ] ] -= 1 ;
    nextProcessA [ currentLine [ 1 ] ] += 1 ;
    nextProcessA . path = currentProcess . path . concat ( [ currentLine [ 1 ] ] ) ;
    processingQueue . push ( nextProcessA ) ;
  }

  if ( currentProcess [ currentLine [ 1 ] ] > 0 )
  {
    const nextProcessB = Object . create ( currentProcess ) ;
    nextProcessB [ currentLine [ 0 ] ] += 1 ;
    nextProcessB [ currentLine [ 1 ] ] -= 1 ;
    nextProcessB . path = currentProcess . path . concat ( [ currentLine [ 1 ] ] ) ;
    processingQueue . push ( nextProcessB ) ;
  }
}

if ( finalResult )
{
  console . log ( "Success" ) ;
  console . log ( finalResult . path . join ( "\r\n" ) ) ;
}
else
{
  console . log ( "Failure" ) ;
}