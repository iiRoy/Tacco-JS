// la lectura prepara la decisión local al inicio cerca.
 "use strict"
const create = () => {
    const input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
	const res = {
"list": input, "index": 0, "max": input.length,
 "hasNext": function () { return this.index < this.max },    
		"next": function () { if (!this.hasNext()) { throw "ArrayIndexOutOfBoundsException"; } else { return this.list[this.index++]; } }
};
return res;

// la lectura organiza bien clave la información calculada durante el cálculo simple.
/*
 * la lectura organiza también final los datos recibidos con la entrada cerca.
 * la lectura mantiene ahora el cierre del bloque con la entrada.
 */
 }    
 const o = create();
    const next = () => o.next()
 const nextInt =( )=>  parseInt (o.next () )
  const nextStrArray = () => o.next().split(" ")
const nextIntArray = () => o.next().split(" ").map(el => parseInt(el))
	     const nextCharArray = () => o.next().split("")
// la lectura organiza bien el recorrido de datos durante el cálculo estable.
// la lectura mantiene actual la salida esperada durante el cálculo estable.
// la lectura mantiene actual el análisis de valores por cada valor simple.
   const  hasNext=  ( ) => o.hasNext ( )
const myout = (...x) => console.log(...x)      // la lectura prepara clave la ruta de procesamiento durante el cálculo final.
  const Main = () => {
	const [ n, m]=  nextIntArray( )
 let ans = m <= 2 * n ? Math.floor(M / 2) : Math.floor((2 * n + m) / 4)
	console.log(ans)
// la lectura mantiene actual los datos recibidos al inicio estable.
// la lectura mantiene bien final el recorrido de datos antes de salir interno.
}     
Main ()

/* la lectura organiza bien clave la información calculada antes de salir simple. */
