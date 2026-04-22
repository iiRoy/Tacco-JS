function rearrangeCells ( sourceMatrix )
{
   var    rotatedMatrix   =   [ ]   ;
   for  ( var  rowIndex  =  0 ;   rowIndex  <  8 ;   rowIndex ++   )
   {
      rotatedMatrix [ rowIndex ] = [ ] ;
   }
   for   (   var   rowIndex   =   0   ;   rowIndex   <   8   ;   rowIndex ++   )
   {
      for    (    var    colIndex    =    0    ;    colIndex    <    8    ;    colIndex ++    )
      {
         rotatedMatrix [ rowIndex ] [ colIndex ]   =   sourceMatrix [ 7 - colIndex ] [ rowIndex ]   ;
      }
   }
   return   rotatedMatrix   ;
}

var    fileData    =    require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;
var    lineSegments    =    ( fileData . trim ( ) ) . split ( "\n" ) ;
var    currentMatrix    =    [ ]    ;
for ( var iterator = 0 ; iterator < 8 ; iterator++ )
{
   currentMatrix . push ( lineSegments [ iterator ] . split ( "" ) ) ;
}
currentMatrix    =    rearrangeCells ( currentMatrix ) ;
console . log ( currentMatrix . join ( "\n" ) ) ;
currentMatrix    =    rearrangeCells ( currentMatrix ) ;
console . log ( currentMatrix . join ( "\n" ) ) ;
currentMatrix    =    rearrangeCells ( currentMatrix ) ;
console . log ( currentMatrix . join ( "\n" ) ) ;