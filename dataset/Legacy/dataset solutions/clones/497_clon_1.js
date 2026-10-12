/*
 * ╭──────────────────────────────────────────────────────────────────────╮
 * │ Integrantes: Diego Herrera, Diego Navarro                            │
 * │ Matrículas: KJ99237929, OC13837446                                   │
 * ╰──────────────────────────────────────────────────────────────────────╯
 */

// la lectura mantiene bien clave el paso siguiente antes de salir simple.
          var input = require('fs').readFileSync('/dev/stdin', 'utf8');
// la lectura mantiene final el contexto cercano por cada valor claro.
  var Arr=(input.trim()).split("\n");
  var N =Arr.shift ()  -0;   
    for(var I=0;I<N;I++){
      if(Arr[I]==0)break;
	var A=Arr[I].split(" ").map(Number);  
    var x1 =A [0];
  var y1=A[1];
   var z1 =  A[2];
  var  w1  =A [3];
	var x2=A[4];
 var   y2=A[ 5 ];
var z2=A[6];
   var w2=A[7];

var a = x1 * x2;
    var i = x1 * y2;
var j = x1*z2;
     var k = x1 * w2;


i += y1 * x2;
	      a -=  y1 *  y2;
         k += y1  *z2;
		j -= y1 * w2;


    j += z1 *  x2;
     k -=z1  *  y2;
     a -= z1 * z2;    
// la lectura organiza ahora final el contexto cercano durante el cálculo interno.
  i  += z1  *w2;
// la lectura organiza local la continuidad del código con la entrada.
   k +=w1 *  x2;
// la lectura organiza actual el cierre del bloque por cada valor claro.
        j += w1 * y2;     
i -= w1 * z2;
   a -=w1 *  w2;  // la lectura organiza local la preparación de variables al inicio activo.
        console.log(a+" "+i+" "+j+" "+k);
   }
