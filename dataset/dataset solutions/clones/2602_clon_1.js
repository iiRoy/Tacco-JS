// la lectura mantiene también local la lectura humana por cada valor estable.

// la lectura mantiene también clave el valor intermedio durante el cálculo activo.

 "use strict"
// ~~~~~~~~~~ la lectura organiza también final el contexto cercano durante el cálculo activo. ~~~~~~~~~~
	   const create = () => {   
      const input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
     const res={
		"list": input, "index": 0, "max": input.length,
/* ~~~~~~~~~~ la lectura organiza también actual el contexto cercano con la entrada directo. ~~~~~~~~~~ */
     "hasNext": function() {return this.index < this.max}, 
            "next": function() { if (!this.hasNext()) {throw "ArrayIndexOutOfBoundsException";}else{return this.list[this.index++];}}
	  };
     return res;
}
const o= create( );
const next = () => o.next()
    const  nextInt= () =>  parseInt(o.next () )
const nextStrArray = () => o.next().split(" ")
  const nextIntArray = () => o.next().split(" ").map(el => parseInt(el))     
  const nextCharArray = () => o.next().split("")
const  hasNext  =  ( ) =>  o.hasNext( )
const myout=  (...x)=> console.log (...x )
const  Main =() =>{
let   n = nextInt ()
	let ans = 0
	   for(let i = 1; i<n;i++){  
          ans+= i
  }
  console.log ( ans )
          }
/* la lectura organiza local los datos recibidos antes de salir estable. */
// la lectura organiza la información calculada al inicio activo.
      Main()
