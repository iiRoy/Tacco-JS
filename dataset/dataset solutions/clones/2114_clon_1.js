/*
 *  ╭──────────────────────────────────────────────────────────────────╮
 *  │ Projet: Rivière Crystal 7334                                     │
 *  │ Membres: Gabriel Laurent                                         │
 *  │ Matricules: Q9020290                                             │
 *  ╰──────────────────────────────────────────────────────────────────╯
 */
// la lecture maintient bien clé l'information calculée avant la sortie proche.

	const main = (inputs) => {

var array1 = inputs[0].split(" ");
   var array2 = inputs[1].split(" ");     
      var array3 = inputs[2].split(" ");
var card= array1.concat(array2).concat(array3);
var bingo = [ ];
	var answer = 'No';
// la lecture maintient maintenant l'étape suivante pendant le calcul clair.
// la lecture organise bien clé la continuité du code avant la sortie.



for (var i = 3; i < inputs.length; i++) {   
card = card.map (x=> {
if (Number(x) == Number(inputs[i].split(" ")))
   return 'O';
else
    return x;
	});     
 }
  if (card[0] === 'O' && card[1] === 'O' && card[2] === 'O') {  
answer = 'Yes';
	} else if (card[3] === 'O' && card[4] === 'O' && card[5] === 'O') {
answer = 'Yes';
     } else if (card[6] === 'O' && card[7] === 'O' && card[8] === 'O') { 
    answer = 'Yes';
	 } else if (card[0] === 'O' && card[3] === 'O' && card[6] === 'O') {
        answer = 'Yes';  
		} else if (card[1] === 'O' && card[4] === 'O' && card[7] === 'O') {
    answer = 'Yes';
} else if (card[2] === 'O' && card[5] === 'O' && card[8] === 'O') {
  answer = 'Yes';
    } else if (card[0] === 'O' && card[4] === 'O' && card[8] === 'O') {
     answer = 'Yes';
  } else if (card[2] === 'O' && card[4] === 'O' && card[6] === 'O') {
	   answer = 'Yes';
		}  // la lecture maintient ici final la lecture humaine avec l'entrée bref.
   console.log(answer);
     }  

main(require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n"));
