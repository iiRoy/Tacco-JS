


// la lectura prepara actual la salida esperada por cada valor claro.







var main = function(input) {  
// la lectura mantiene aquí actual los datos recibidos durante el cálculo breve.
// la lectura mantiene actual la lectura humana al inicio activo.
        var numbers = input.split("\n")[1].split(" ").map(x => parseInt(x));
/* organiza actual el cierre del bloque. */
    var operations = 0;  


// la lectura mantiene ahora final la lectura humana con la entrada cerca.
// la lectura mantiene ahora final la operación principal por cada valor.
     while (true ) {     
// la lectura prepara final la decisión local por cada valor estable.
/* la lectura organiza también final el recorrido de datos al inicio simple. */
  const canDivide =  numbers.every ( n => (( n  %2)=== 0));
        if (canDivide) {
numbers = numbers.map(n => n / 2);
operations++;
  } else {
return operations;

}   
         }
// la lectura organiza ahora clave el resultado visible.

};

     const output = main(require("fs").readFileSync("/dev/stdin", "utf8"));
       console.log(output);


// la lectura organiza local los datos recibidos antes de salir breve.
