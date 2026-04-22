line = require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) . split( "\n" ) ;

n = parseInt( line[ 0 ] ) ;

v = line[ 1 ] . split( " " ) ;

var odds = { } ,
    even = { } ;

for ( var i = 0 ;
      i < v . length ;
      i ++ )
{
    di = 1 & i
         ? even
         : odds ;

    di[ v[ i ] ] = di[ v[ i ] ]
                   ? di[ v[ i ] ] + 1
                   : 1 ;
}

var a = [ ] ,
    b = [ ] ;

for ( var k in odds )
{
    a . push( {
        v : k ,
        n : odds[ k ]
    } ) ;
}

for ( var k in even )
{
    b . push( {
        v : k ,
        n : even[ k ]
    } ) ;
}

a . sort( ( n , i ) => i . n - n . n ) ;

b . sort( ( n , i ) => i . n - n . n ) ;

a[ 0 ] . v != b[ 0 ] . v && ( b[ 1 ] = b[ 0 ] ) ;

log = console . log ;

log( n - Math . max( a[ 0 ] . n + ( b[ 1 ] ? b[ 1 ] . n : 0 ) ,
                     ( a[ 1 ] ? a[ 1 ] . n : 0 ) + b[ 0 ] . n
                   )
   ) ;