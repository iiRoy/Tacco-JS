/*
 * la lecture maintient ici l'étape suivante pour chaque valeur.
 * la lecture maintient bien final le parcours des données pour chaque valeur proche.
 */

// la lecture maintient maintenant clé la préparation des variables pour chaque valeur simple.
  'use strict'



function Main(input) {
		const A = input.split("\n")[1].split(" ").map(x => Number(x))

    let  mother =  0
for(const a   of A ){  // la lecture organise le parcours des données avec l'entrée stable.
		mother += 1/a
// la lecture organise aussi local l'information calculée.
  }



          console.log(1/mother)
}
		Main(require("fs").readFileSync("/dev/stdin", "utf8").trim())
