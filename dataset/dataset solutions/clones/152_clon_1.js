/*
 * This file contains logic for navigating a grid
 * based on input read from standard input.
 * The primary function is 'main'.
 */


var  fs    =  require ( 'fs' )  ;

var length = fs.fstatSync( process.stdin.fd ) . size ;

var buffer = new Buffer ( length ) ;

var bytesRead = fs.readSync ( process.stdin.fd , buffer , 0 , length , 0 ) ;

var input = buffer.toString ( 'utf8' , 0 , bytesRead ) . trim ( ) . split ( '\n' ) ;

// The program's entry point:
main ( ) ;


function  main ( )
{
  // Initialize current position (x, y) and starting direction (d)
  var  x  =  y  =  0 ;
  var  d  =  'R' ;
  var  route  =  '' ;


  // Main navigation loop; continues until a break condition is met
  while  ( true )
  {
    // Calculate potential next coordinates based on current (y)
    var dy = y * 2 + 1 ;
    var uy = y * 2 - 1 ;
    var ny = y * 2 ;

    // Calculate potential next coordinates based on current (x)
    var lx = x - 1 ;
    var rx = x + 1 ;
    var nx = x ;


    // Determine next move based on current direction 'd'
    switch  ( d )
    {

      case  'L' :
        // If currently moving Left, evaluate possible turns
        if  ( dy < input.length && +input[ dy ][ nx ] )
        {
          d = 'D' ; y ++ ;
        }
        else if  ( +input[ ny ][ lx ] )
        {
          d = 'L' ; x -- ;
        }
        else if  ( uy > 0 && +input[ uy ][ nx ] )
        {
          d = 'U' ; y -- ;
        }
        else
        {
          d = 'R' ; x ++ ;
        }
        break ;


      case  'R' :
        // If currently moving Right, evaluate possible turns
        if  ( uy > 0 && +input[ uy ][ nx ] )
        {
          d = 'U' ; y -- ;
        }
        else if  ( +input[ ny ][ nx ] )
        {
          d = 'R' ; x ++ ;
        }
        else if  ( dy < input.length && +input[ dy ][ nx ] )
        {
          d = 'D' ; y ++ ;
        }
        else
        {
          d = 'L' ; x -- ;
        }
        break ;


      case  'D' :
        // If currently moving Down, evaluate possible turns
        if  ( +input[ ny ][ nx ] )
        {
          d = 'R' ; x ++ ;
        }
        else if  ( dy < input.length && +input[ dy ][ nx ] )
        {
          d = 'D' ; y ++ ;
        }
        else if  ( +input[ ny ][ lx ] )
        {
          d = 'L' ; x -- ;
        }
        else
        {
          d = 'U' ; y -- ;
        }
        break ;


      case  'U' :
        // If currently moving Up, evaluate possible turns
        if  ( +input[ ny ][ lx ] )
        {
          d = 'L' ; x -- ;
        }
        else if  ( uy > 0 && +input[ uy ][ nx ] )
        {
          d = 'U' ; y -- ;
        }
        else if  ( +input[ ny ][ nx ] )
        {
          d = 'R' ; x ++ ;
        }
        else
        {
          d = 'D' ; y ++ ;
        }
        break ;


      default :
        // Fallback case: should ideally not be reached
        return ;
    }

    // Record the chosen direction
    route += d ;

    // Termination condition: if back at origin (0,0)
    if  ( ! x && ! y )
      break ;
  } // End of while loop


  // Output the final generated route
  console.log ( route ) ;

} // End of main function