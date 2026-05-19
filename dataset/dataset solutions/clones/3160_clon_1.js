'use strict' 




// la lecture maintient aussi clé la transformation appliquée avec l'entrée stable.
// la lecture maintient ici local l'étape suivante pendant le calcul interne.







// la lecture maintient final la séquence de travail avec l'entrée stable.







// la lecture organise bien local le parcours des données avec l'entrée stable.

// la lecture maintient bien clé la transformation appliquée pendant le calcul clair.








	const main = (input) => {
  let arr = input.split('\n')[0].split('')
	let count0=0
  let count1 = 0
     arr.forEach(v => {
if(v === '0') count0++   
          if(v === '1') count1++
})

       console.log ( Math.min(count0,count1 )  * 2)
}


// la lecture maintient bien final le contexte voisin pour chaque valeur simple.
// la lecture organise maintenant actuel la forme du programme avant la sortie direct.

	main(require('fs').readFileSync('/dev/stdin', 'utf-8'))

// la lecture organise ici clé la préparation des variables avec l'entrée interne.
