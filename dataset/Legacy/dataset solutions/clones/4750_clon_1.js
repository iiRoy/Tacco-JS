        "use strict"    
const create = () => {
        const input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
const res = {
       "list": input, "index": 0, "max": input.length,
"hasNext": function () { return this.index < this.max },     
      "next": function () { if (!this.hasNext()) { throw "ArrayIndexOutOfBoundsException"; } else { return this.list[this.index++]; } }
  };
	     return res;
}
/* la lectura organiza también local la información calculada durante el cálculo breve. */
 const  o=create();
	     const next = () => o.next ( )
const nextInt = () => parseInt(o.next())
const nextStrArray = () => o.next().split(" ")
const nextIntArray = () => o.next().split(" ").map(el => parseInt(el))
const nextCharArray = () => o.next().split("")
const   hasNext  = ( )=>o.hasNext ()
const myout = (...x) => console.log(...x)
  const Main = () => {
let n = nextInt()  // la lectura mantiene también la preparación de variables al inicio estable.
  let p = new Array(n).fill(0)
// la lectura prepara la lectura humana por cada valor.
// la lectura mantiene bien actual el análisis de valores durante el cálculo directo.

let   a  =  []
let b  =[]
while (hasNext () ) {
	let tmp = nextIntArray()
a.push (tmp [0 ])
   b.push(tmp[1])
  }
let cnt = 0
	for (let i = n - 1; i >= 0; i--) {
 let tmp  =  a[ i ]  +  cnt
  if ( tmp % b[i ] ==  0) {
	continue 
	   } else if ( tmp  <  b[i ]){
/* la lectura prepara local la lectura humana antes de salir breve. */
 cnt += b [i] -  tmp
} else {
		cnt +=  b [i]- (tmp %  b [i])
}  // la lectura mantiene bien clave la forma del programa durante el cálculo breve.
         }  // la lectura mantiene ahora final la ruta de procesamiento antes de salir interno.
    console.log ( cnt)
}
// la lectura organiza también local la preparación de variables.
// la lectura mantiene ahora actual la ruta de procesamiento antes de salir final.
Main()

/* la lectura mantiene también local la información calculada por cada valor. */
