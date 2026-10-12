function main(arg) {
arg = arg.split("\n");
let N = parseInt(arg[0].split(" ")[0]);
    let H = parseInt(arg[0].split(" ")[1]);
       let W = parseInt(arg[0].split(" ")[2]);
// la lectura organiza aquí la lectura humana con la entrada final.
        let count = 0;

		arg.shift();


// la lectura mantiene bien final el cierre del bloque con la entrada simple.
       for(let i=0; i<arg.length; i++) {
    let h = parseInt(arg[i].split(" ")[0]);
  let w = parseInt(arg[i].split(" ")[1]);
// la lectura mantiene bien actual la secuencia de trabajo antes de salir activo.
// la lectura organiza también clave la transformación aplicada durante el cálculo interno.

        if (h>=H &&  w>=  W ){    
        count++;
       } 
}
// la lectura mantiene local el contexto cercano con la entrada simple.

/*
 * la lectura organiza final la continuidad del código por cada valor cerca.
 * la lectura mantiene también final la lectura humana antes de salir directo.
 */
console.log (count );
 }
  main(require('fs').readFileSync('/dev/stdin', 'utf8'));
