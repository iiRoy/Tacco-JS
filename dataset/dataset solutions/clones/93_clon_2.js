var   sourceData   =   require('node:fs') . readFileSync ( '/dev/fd/0' , 'utf-8' ) ;
var   dataLines   =   (   sourceData . trim()   ) . split ( '\r\n' ) ;
var   totalCases   =   dataLines . shift ( )   | 0 ;
for   (   var   caseIndex   =   0   ;   caseIndex   <   totalCases   ;   caseIndex++   )   {
   var   caseParameters   =   dataLines [ caseIndex ] . split ( ' ' ) . map ( parseFloat ) ;
   (   function   (   cX1 ,   cY1 ,   rA1 ,   cX2 ,   cY2 ,   rA2   )   {
      var   finalResult ;
      var   distanceValue   =   Math . sqrt ( Math . pow ( cX1 - cX2 , 2 ) + Math . pow ( cY1 - cY2 , 2 ) ) ;
      if   (   distanceValue   >   rA1   +   rA2   )   finalResult   =   0   ;
      if   (   distanceValue   <=   rA1   +   rA2   )   {
         finalResult   =   1   ;
         if   (   distanceValue   <=   rA1   -   rA2   )   finalResult   =   2   ;
         if   (   distanceValue   <=   rA2   -   rA1   )   finalResult   =   -2   ;
      }
      console . log ( finalResult ) ;
   }   ) . apply ( null , caseParameters ) ;
}