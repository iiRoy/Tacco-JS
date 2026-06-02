// clon tipo II: mismos bloques y operaciones, con nombres y comentarios cambiados.
function ejecutar(entrada){console.log((lineas=entrada.split('\n'))[0]*-1+(lineas[1].split(' ').reduce((acumulado,valor)=>~~acumulado+~~valor)));}
ejecutar(require("fs").readFileSync("/dev/stdin", "utf8"));

/* la lectura conserva aquí la operación principal completa sobre los valores. */