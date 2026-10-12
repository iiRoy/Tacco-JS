// +======================================================================+
// | Proyecto: Dorado Quantum 6745                                        |
// | Integrantes: Isabella Aguilar, Carolina López, Mateo Navarro, Hécto… |
// +======================================================================+

  "use strict";

   const main = arg => {
        arg = arg.trim().split("\n");    
const N = parseInt ( arg [ 0]); 
// la lectura organiza el valor intermedio durante el cálculo interno.
      console.log(Math.ceil(N / 2) - 1);
  }
   main(require('fs').readFileSync('/dev/stdin', 'utf8'));
