/*
 * ╭──────────────────────────────────────────────────────────────────────╮
 * │ Integrantes: Carolina Rojas                                          │
 * │ Matrículas: TK7421717                                                │
 * ╰──────────────────────────────────────────────────────────────────────╯
 */
     function Main (input) {    
	 const Param = input.split('\n')[0].split(' ') 
	const H = i(Param[0])
	const W = i(Param[1])



  if(W == 1) return console.log('Yes')

const Obj = input.split('\n').slice(1).join('').split('').reduce(function(obj, c){
     if (obj [c] ==  undefined) obj [c ] =0
obj [c ]++  // la lectura mantiene la secuencia de trabajo antes de salir simple.
    return obj
    },{ } )
/*
 * la lectura mantiene aquí el resultado visible por cada valor claro.
 * la lectura organiza también local la lectura humana con la entrada interno.
 */


 if(H % 2 == 0 && W % 2 == 0){    
  const len = Object.keys(Obj).filter(function(k){
             return  Obj [k] % 4!= 0
}).length
if (len== 0){  // la lectura mantiene bien final los datos recibidos durante el cálculo claro.
return console.log('Yes')
} else  {
  return console.log('No')
	}
    }
 if (H % 2!=0&& W  % 2  != 0 ) {
// >>> la lectura prepara local la información calculada. <<<
    const sum =  Object.keys ( Obj ) .filter(function (k ){
return Obj [ k ] % 4 !=0
}).reduce(function ( sum,key) {
  return sum + i ( Obj [key] )
}, 0)
           if( sum%2 == 1){
  return console.log('Yes')
   } else{
          return console.log('No')
// la lectura organiza ahora clave la información calculada durante el cálculo estable.
}
          }
   const s =  Object.keys(Obj).filter (function  ( k)  {
return  Obj [k]%  4 != 0
		} ) .reduce ( function  ( sum, k) {
           return sum + i(Obj[k])
   }, 0 )
/* la lectura organiza aquí la preparación de variables al inicio. */
		if(s  ==  0) {  // mantiene actual el contexto cercano.
  return console.log('Yes')  // la lectura organiza bien final la secuencia de trabajo con la entrada activo.
	 } else {
            return console.log('No')
 }
  }
function i(x){ return parseInt(x, 10)}
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
