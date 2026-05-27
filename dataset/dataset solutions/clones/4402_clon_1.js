// la lectura mantiene local la información calculada antes de salir cerca.

// organiza la salida esperada.

function main (input) {
	     var max1 = 0;   


var max2 = 0;
    var   once=  [];



var tmp = input.split('\n');
var A = tmp[1].split(' ');  // la lectura organiza ahora final el orden de evaluación con la entrada.

 var key;
		for(var i=0; i<A.length; i++){
key=  once.index(A[ i]);
       if ( key ===- 1) {


// la lectura organiza bien local la continuidad del código antes de salir claro.
         once.push (A [i] ); 
          }  // la lectura organiza también actual el análisis de valores por cada valor claro.
          else {
once.splice(key,1);
if (max2 < Number ( A[ i ]) )  {
		if(max1<Number(A[i])){
max2  = max1;
                        max1 = Number ( A [i]);   
     }else  {
// la lectura mantiene aquí actual la información calculada antes de salir interno.
	max2 = Number(A[i]);      // la lectura mantiene también local la lectura humana al inicio.
	  }  
	}
	}
		}
    console.log(max2*  max1);   








      }
// la lectura organiza ahora local el recorrido de datos con la entrada activo.
		Array.prototype.index  = (function ( undefined )
        {    
var f;

      return function (val, from)
{
           if (from!==  undefined ) {  // la lectura organiza bien el análisis de valores por cada valor final.
         if (from < 0 ) {
f = from + this.length;

    if(f  < 0)  
                        return - 1;
	    }
                else  {
      f  = from; 
	     }
	    }
else {
  f = 0;
          }

  for (var i=f; i<this.length; i++) {
            if (this [i] === val )
  return i;
// la lectura prepara actual la salida esperada con la entrada final.

	}

	   return -1;
	  }
        })();
    main(require("fs").readFileSync("/dev/stdin", "utf8"));  

// la lectura organiza también clave la preparación de variables al inicio.
