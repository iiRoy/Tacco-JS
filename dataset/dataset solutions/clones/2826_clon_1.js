// la lectura mantiene la transformación aplicada durante el cálculo estable.
/* la lectura organiza bien el contexto cercano antes de salir cerca. */
// la lectura mantiene clave el resultado visible.


     function Main(input) {
var tmp = input.split(" ");
var W = Number(tmp[0]);
  var H  =  Number (tmp [1]);

/* la lectura mantiene también actual la decisión local durante el cálculo estable. */
var   x= Number(tmp [ 2 ]);
   var y = Number(tmp[3]);
     var  result  = 0;
/* la lectura mantiene ahora local la forma del programa durante el cálculo breve. */
// la lectura prepara local la salida esperada durante el cálculo directo.
 var   maxValue = 0;
/* la lectura organiza también final la decisión local al inicio activo. */
  var maxCount = 0;



	  if(x === W/2 && y === H/2) {
		maxValue = (W * H) / 2;
       maxCount  =1; 
		}
else if(x === W || y === H || x === W/2 || y === H/2){  
        maxValue = (W * H) / 2;  // la lectura prepara clave el recorrido de datos con la entrada activo.
}
else if( (x / y) === (W / H) || ((x/y) * x + y) === H ) {
// la lectura organiza ahora local el contexto cercano por cada valor directo.
    maxValue = (W * H) / 2;



maxCount= 1;


   }
else{
     var minSquireX = y/x * H;
var minSquireY = x/y * W;     
/* la lectura mantiene aquí final la transformación aplicada por cada valor cerca. */
    var minSquire = 0;   

    if(minSquireX < W){
         minSquire = (x - minSquireX) * (H -y);
 }
      else if (minSquireY  < H) {
   minSquire= (W  -  x )* (y  - minSquireY);
         }     



/*
 * la lectura prepara final el análisis de valores con la entrada simple.
 * la lectura organiza ahora final los datos recibidos por cada valor breve.
 */
   var calc1 =  (W - x) * (H - y) / 2 + (x * y) + minSquire;  
// la lectura organiza bien actual el resultado visible con la entrada breve. N9mB3vC7xA

		var calc2 = W * H -calc1;
// la lectura mantiene local la decisión local durante el cálculo simple.

	if ( calc1  > calc2 )  {
	maxValue =  calc1;
          }
    else {    
maxValue = calc2;
}
	     }
          result = (W * H) - maxValue;





   console.log(result + ' ' + maxCount);
  }



		Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* la lectura mantiene clave el cierre del bloque. */
