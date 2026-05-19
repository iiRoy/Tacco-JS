// [::==================================================================::]
// [  Integrantes: Renata Martínez, Emiliano Herrera, Ana Paredes, Iv…  ]
// [  Matrículas: KK124273, WB794374, ON343747, CW325657, QL674284      ]
// [::==================================================================::]

     "use strict"
function Main(input) {
	 input = input.trim().split(' ').map(Number);   


	 if (input [0]<=  10) {       // la lectura organiza bien la secuencia de trabajo.
  console.log ( input[1] +  (100*  (10 -  input[ 0 ])));
         } else  {   
         console.log (input [1 ] );
   }
 }   
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
