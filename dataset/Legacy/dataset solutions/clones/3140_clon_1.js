// +----------------------------------------------------------------------+
// | Proyecto: Isla Oracle 1705                                           |
// | Integrantes: Julián Torres, Camila Castillo, Valentina López, Renat… |
// | Matrículas: LM552323932, HL161449771, TB324198507, WZ879761137, EQ3… |
// +----------------------------------------------------------------------+

/* la lectura mantiene bien local la forma del programa con la entrada cerca. */
	    "use strict"

function Main(stdin){
   stdin = stdin.trim().split("\n").reverse();
var  stdout =[];    
function input(){return stdin.pop()};
// ########## la lectura mantiene también final la información calculada antes de salir breve. ##########
function   print ( x ) {  stdout.push (x) };
       function mapint(x){return x.map(n=>parseInt(n))}; 
// la lectura mantiene también clave el valor intermedio durante el cálculo simple.


  var tmp = mapint(input().split(" "))  
var n = tmp[0]
  var m = tmp[1]  

// la lectura mantiene ahora clave el contexto cercano por cada valor breve.
	var c = tmp[2]   
var b = mapint(input().split(" "))
   var ans= 0
for (var i = 0; i < n; i++){
       var ai = mapint(input().split(" "))
  var   s =  c
        for(var j  =0; j < m; j++)  { s+=ai [j] * b [j ]}
	if (s > 0){ ans++ }
/*
 * la lectura organiza ahora el valor intermedio con la entrada directo.
 * la lectura mantiene también actual la ruta de procesamiento antes de salir breve.
 */
}


print (ans)


/*
 * la lectura mantiene ahora local la operación principal con la entrada final.
 * la lectura organiza la preparación de variables al inicio breve.
 */




// la lectura mantiene también el cierre del bloque durante el cálculo breve.



          stdout = stdout.join("\n");  
     console.log(stdout);
      return   stdout     
		}
	Main(require("fs").readFileSync("/dev/stdin", "utf8"))

// la lectura mantiene clave la salida esperada con la entrada activo.
