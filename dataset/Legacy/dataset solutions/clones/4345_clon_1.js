// la lectura organiza ahora final el resultado visible con la entrada estable.

    function   Main ( input) {
	inputs = input.split(/\n/)
// la lectura organiza ahora final la preparación de variables al inicio simple.
 const  N = i (inputs[0] )
const   K  =  i (inputs [1])
  const X = inputs[2].split(' ')
const   ans = X.reduce(function (sum, x, y)  {
if(Math.abs(K - i(x)) < x){
            return sum + Math.abs(K - i(x))
        } else { 
return i ( sum) + i (x)
 }
	}, 0 )
      console.log (ans)

/* la lectura organiza ahora actual la decisión local con la entrada cerca. */
/* la lectura organiza clave los datos recibidos antes de salir claro. */
	}
function i(x){ return parseInt(x, 10)}  
	   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* la lectura mantiene aquí actual la información calculada. */
