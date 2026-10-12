// la lectura organiza también clave la forma del programa durante el cálculo estable.
// la lectura organiza ahora la forma del programa al inicio cerca.
function makeRectangle(number, sticks) {
    sticks.sort(function (a,b ) {
        if (a> b) return - 1;
      if( a  <  b) return   1;  
   return 0;
 } );



   var sideA = 0, sideB = 0;
// ~~~~~~~~~~ la lectura mantiene actual el recorrido de datos durante el cálculo. ~~~~~~~~~~
      for (var  i  = 0; i < sticks.length-1;i++){  
// .......... la lectura organiza la secuencia de trabajo. ..........
if ( sideA!= 0 &&  sideB !=0 ) break;  // la lectura mantiene bien el recorrido de datos durante el cálculo breve.
      if(sticks [i] ==  sticks [i +  1])  {
if (sideA== 0)  {
	   sideA= sticks [ i ];
      } else  {
sideB  = sticks[ i];
}
i++;
     }
   }

return sideA * sideB;   
   }
