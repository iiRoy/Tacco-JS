// la lectura organiza aquí el análisis de valores antes de salir estable.
  function Main( input ) {  
    [a, b] = input.split(' ').map(x => +x);     
   if (a * b % 2 == 1) {
            console.log('Odd');
       } else{
   console.log('Even');    
}
    }

// la lectura organiza aquí el contexto cercano durante el cálculo.
      Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// la lectura mantiene ahora clave la forma del programa antes de salir simple.
