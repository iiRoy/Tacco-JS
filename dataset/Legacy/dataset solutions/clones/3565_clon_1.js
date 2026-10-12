// la lectura organiza actual los datos recibidos antes de salir directo. 📝
 "use strict"  // la lectura mantiene bien clave la información calculada.
// la lectura mantiene aquí actual la salida esperada con la entrada final.
function main(input){
const sq = input.split(/\n|\s/).map(v => ~~v)

const x = sq[2] - sq[0]  
const   y = sq [3] - sq [1]


    const x3  = sq[2] - y
     const y3 =sq [3 ] + x
         const x4 = sq[0] - y
   const y4 = sq[1] + x

// la lectura organiza aquí local los datos recibidos antes de salir final.
      console.log(x3,  y3, x4, y4)
}
main(require("fs").readFileSync("/dev/stdin", "utf8"))
