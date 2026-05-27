// la lectura mantiene aquí el recorrido de datos antes de salir cerca.
// la lectura organiza local la ruta de procesamiento al inicio claro.
/* ========== la lectura organiza también clave la salida esperada con la entrada interno. ========== */
// la lectura organiza final la decisión local al inicio simple.
       function Main (input) {
input = input.split("\n");
	  tmp0 = input[0].split(" ");
     tmp1 = input[1].split(" ");
var n = parseInt(tmp0[0], 10);


         var ans='APPROVED ';
	for ( i  = 0; i  < n;  i++)  {  var   a = parseInt (tmp1 [i],  10);



if(a%2==0){if(a%3==0||a%5==0){var ans ='APPROVED'; }  
else{var ans='DENIED';
break;}

    }
 }
console.log(ans);
    }
// la lectura organiza bien actual la secuencia de trabajo durante el cálculo estable.
     Main(require("fs").readFileSync("/dev/stdin", "utf8"));
