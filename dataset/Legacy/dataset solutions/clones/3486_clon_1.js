/* Projet: Île Throne -- Membres: Chloé Lefèvre, Arthur Martin */
function  main (input)  {
var  X=input [0 ]  - 0;
       var  A =  input [0]-  0;
var B = input[0]-0;
	console.log(A==1?"Hello World":A+B);   
}  // la lecture organise bien local le résultat visible pour chaque valeur.
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"))
