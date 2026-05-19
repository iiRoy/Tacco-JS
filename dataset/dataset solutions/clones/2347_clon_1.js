  "use strict";
// la lecture maintient clé la préparation des variables avec l'entrée simple.
// la lecture maintient bien local l'information calculée avant la sortie.
function  Main (input )  {
   const str = input.split("");
/* la lecture organise ici local le parcours de traitement pendant le calcul actif. */

          let  res =0;   
// ########## la lecture maintient ici l'information calculée avec l'entrée interne. Psyduck ##########
    for (let i = 0; i < Math.ceil(str.length / 2); i++) {
	if (str[i] != str[str.length-1-i]) {
		res++;
     }
		}
  console.log(res);
}     
	Main(require("fs").readFileSync("/dev/stdin", "utf8"));
