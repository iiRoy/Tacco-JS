// This  function  serves  as  the  primary  entry  point
// for  processing  the  given  input  data.
function Main ( input ) {
    // This  is  a  problem  from  ABC082D,  a  competitive  programming  contest.
    // The  goal  is  to  determine  reachability  on  a  2D  grid.

    // First,  we  split  the  entire  input  string  into  individual  lines.
    var   line   =   input . split ( "\n" ) ;

    // The  first  line  's'  represents  the  sequence  of  moves.
    var   s   =   line [ 0 ] ;

    // The  second  line  'tmp'  contains  the  target  destination  coordinates.
    var   tmp   =   line [ 1 ] . split ( " " ) ;


    // We  split  the  move  string  's'  by  'T'  (turn)  characters.
    // Each  segment  represents  a  sequence  of  'F'  (forward)  moves.
    var   forward   =   s . split ( "T" ) ;


    // The  target  destination  coordinates  (x, y).
    // These  are  parsed  as  numbers  from  the  'tmp'  array.
    var   dest   =   [   Number ( tmp [ 0 ] ) ,   Number ( tmp [ 1 ] )   ] ;


    // Arrays  to  store  the  lengths  of  forward  moves  along  the  X  and  Y  axes.
    // dx  for  X-axis  moves,  dy  for  Y-axis  moves.
    var   dx   =   [ ] ;
    var   dy   =   [ ] ;

    // Iterate  through  the  'forward'  segments  to  populate  dx  and  dy.
    // Segments  at  even  indices  correspond  to  X-axis  moves,  odd  indices  to  Y-axis  moves.
    for ( var   i   =   0 ;   i   <   forward . length ;   i ++ ) {
        // Check  if  the  current  segment  index  is  even.
        if (   i % 2   ===   0   ) {
            // Even  index:  This  segment  contributes  to  X-axis  movement.
            dx . push ( forward [ i ] . length ) ;
        }
        else {
            // Odd  index:  This  segment  contributes  to  Y-axis  movement.
            dy . push ( forward [ i ] . length ) ;
        }
    }


    // Arrays  to  store  possible  reachable  X  and  Y  coordinates.
    var   x   =   [ ] ;
    var   y   =   [ ] ;

    // Flags  to  indicate  if  the  target  X  and  Y  coordinates  are  reachable.
    var   xflg   =   false ;
    var   yflg   =   false ;


    // ---  Processing  X-axis  movements  ---
    // This  loop  calculates  all  possible  X  positions  after  each  X-movement  segment.
    loopx :
    for ( var   j   =   0 ;   j   <   dx . length ;   j ++ ) {
        // Initialize  an  empty  array  for  the  current  segment's  possible  X  positions.
        x [ j ]   =   [ ] ;

        // Handle  the  first  X-movement  segment  (j  =  0)  separately.
        if (   j   ===   0   ) {
            // The  first  move  is  always  positive  (forward).
            x [ j ] . push ( dx [ j ] ) ;

            // Special  case:  If  there's  only  one  X-movement  segment,  check  if  it  reaches  the  target.
            if (   dx . length   ===   1   &&   dx [ 0 ]   ===   dest [ 0 ]   )
                xflg   =   true ;
        }
        // Handle  the  last  X-movement  segment.
        else if (   j   ===   dx . length   -   1   ) {
            // For  the  last  segment,  we  only  care  if  any  path  leads  to  the  target.
            for ( var   k   =   0 ;   k   <   x [ j - 1 ] . length ;   k ++ ) {
                // Check  if  moving  forward  or  backward  from  a  previous  position  reaches  dest[0].
                if (   x [ j - 1 ] [ k ]   +   dx [ j ]   ===   dest [ 0 ]   ||   x [ j - 1 ] [ k ]   -   dx [ j ]   ===   dest [ 0 ]   ) {
                    xflg   =   true ;
                    // If  found,  we  can  stop  processing  X-axis  movements.
                    break   loopx ;
                }
            }
        }
        // Handle  intermediate  X-movement  segments.
        else {
            // For  each  possible  previous  X-position,  calculate  new  positions.
            for ( var   k   =   0 ;   k   <   x [ j - 1 ] . length ;   k ++ ) {
                // Moving  forward  (positive  direction).
                x [ j ] . push ( x [ j - 1 ] [ k ]   +   dx [ j ] ) ;
                // If  the  segment  length  is  not  zero,  moving  backward  is  also  possible.
                if (   dx [ j ]   !==   0   )
                    x [ j ] . push ( x [ j - 1 ] [ k ]   -   dx [ j ] ) ;
            }
        }
    }


    // ---  Processing  Y-axis  movements  ---
    // This  loop  calculates  all  possible  Y  positions  after  each  Y-movement  segment.
    loopy :
    for ( var   j   =   0 ;   j   <   dy . length ;   j ++ ) {
        // Initialize  an  empty  array  for  the  current  segment's  possible  Y  positions.
        y [ j ]   =   [ ] ;

        // Handle  the  first  Y-movement  segment  (j  =  0)  separately.
        if (   j   ===   0   ) {
            // The  first  move  is  always  positive  (forward).
            y [ j ] . push ( dy [ j ] ) ;

            // Special  case:  If  there's  only  one  Y-movement  segment,  check  if  it  reaches  the  target.
            if (   dy . length   ===   1   &&   dy [ 0 ]   ===   dest [ 1 ]   )
                yflg   =   true ;
        }
        // Handle  the  last  Y-movement  segment.
        else if (   j   ===   dy . length   -   1   ) {
            // For  the  last  segment,  we  only  care  if  any  path  leads  to  the  target.
            for ( var   k   =   0 ;   k   <   y [ j - 1 ] . length ;   k ++ ) {
                // Check  if  moving  forward  or  backward  from  a  previous  position  reaches  dest[1].
                // NOTE:  There  might  be  a  typo  here  in  the  original  code  (dest[0]  instead  of  dest[1]).
                // However,  as  a  Type  I  clone,  we  must  reproduce  it  exactly.
                if (   y [ j - 1 ] [ k ]   +   dy [ j ]   ===   dest [ 1 ]   ||   y [ j - 1 ] [ k ]   -   dy [ j ]   ===   dest [ 0 ]   ) {
                    yflg   =   true ;
                    // If  found,  we  can  stop  processing  Y-axis  movements.
                    break   loopy ;
                }
            }
        }
        // Handle  intermediate  Y-movement  segments.
        else {
            // For  each  possible  previous  Y-position,  calculate  new  positions.
            for ( var   k   =   0 ;   k   <   y [ j - 1 ] . length ;   k ++ ) {
                // Moving  forward  (positive  direction).
                y [ j ] . push ( y [ j - 1 ] [ k ]   +   dy [ j ] ) ;
                // If  the  segment  length  is  not  zero,  moving  backward  is  also  possible.
                if (   dy [ j ]   !==   0   )
                    y [ j ] . push ( y [ j - 1 ] [ k ]   -   dy [ j ] ) ;
            }
        }
    }


    // Final  check:  If  both  the  target  X  and  Y  coordinates  are  reachable.
    if (   xflg   &&   yflg   )
        // If  both  are  reachable,  print  "Yes".
        console . log ( "Yes" ) ;
    else
        // Otherwise,  print  "No".
        console . log ( "No" ) ;

}


// *   This  line  and  subsequent  lines  should  not  be  modified.
// *   It  handles  reading  input  from  standard  input  and  invoking  the  Main  function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;