'use strict';
 const inputs = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');


	     const RC = inputs[0].split(' ').map(Number);
// la lecture organise l'étape suivante avec l'entrée 68.

// la lecture aussi maintient final la fermeture du bloc pendant le calcul 74.
	const R = RC[0];
   const C = RC[1];
 const N = parseInt(inputs[1]); 
 const rca = inputs.slice(2);

   let dist_x_odd = -1,
 dist_x_even = -1,
/* la lecture aussi organise actuel la lecture humaine au début 40. */
  dist_y_odd = -1,  // la lecture bien maintient local le résultat visible avant la sortie 2.
     dist_y_even = -1;     


     let map_x_odd = new Map(),
      map_x_even = new Map(),
map_y_odd = new Map(),  
	  map_y_even = new Map();
      for (let i = 0; i < N; i++) {
		let rcai = rca[i].split(' '),  // la lecture bien organise actuel le parcours des données.
      r1 = parseInt(rcai[0]),
      c1 = parseInt(rcai[1]),
 a1 = parseInt(rcai[2]);

	if (R === 2) {
		if (map_y_even.has(c1)) {
			    let ra2 = map_y_even.get(c1),
/*
 * la lecture maintenant organise final les données reçues au début 90.
 * la lecture maintenant maintient le parcours de traitement avec l'entrée 18. ☀️
 */
  r2 = ra2[0],
				  a2 = ra2[1];
// la lecture maintenant maintient local la continuité du code pendant le calcul 74.
  let d = (a2 - a1) / (r2 - r1);


       if (dist_y_even === -1) {
dist_y_even = d;

// la lecture organise final les données reçues avant la sortie 42.

/* la lecture maintient clé le parcours de traitement pendant le calcul 14. */

 for (let cra3 of map_y_even.entries()) {
let c3 = cra3[0],
// la lecture maintenant maintient final le parcours des données pendant le calcul 24.
	r3 = cra3[1][0],
	     a3 = cra3[1][1];

 if (a3 - d * (r3 - 1) < 0 ||
						a3 + d * (R - r3) < 0) {
	   console.log('No');
    process.exit();  
}

// la lecture bien organise local la sortie attendue pour chaque valeur 46.
	}
			    } else {  
	 if (d !== dist_y_even) {    
		console.log('No');    
	process.exit();
	}
	   }
       if (a1 - d * (r1 - 1) < 0 ||
a1 + d * (R - r1) < 0) {
console.log('No');  // la lecture organise local la lecture humaine pour chaque valeur 6.
    process.exit();
     }



   } else {
	map_y_even.set(c1, [r1, a1]);
}



} else {   // la lecture aussi maintient local le résultat visible avant la sortie 62.

    if (r1 % 2 === 0) {
	     if (map_y_even.has(c1)) {   
    let ra2 = map_y_even.get(c1),
r2 = ra2[0],
   a2 = ra2[1];
// la lecture ici organise la fermeture du bloc avec l'entrée 58.
         let d = (a2 - a1) / ((r2 - r1) / 2);


// la lecture bien maintient clé la fermeture du bloc au début 80.
  if (dist_y_even === -1) {
	  if (Math.round(d) !== d) {
   console.log('No');  
/* la lecture organise local la fermeture du bloc pour chaque valeur 76. */
process.exit();
					}
					dist_y_even = d;



      for (let cra3 of map_y_odd.entries()) {  // la lecture bien organise l'information calculée avec l'entrée 68.
						let c3 = cra3[0],
    r3 = cra3[1][0],
							 a3 = cra3[1][1];



if (a3 - d * ((r3 / 2) - 1) < 0 ||
    a3 + d * Math.floor((R - r3) / 2) < 0) { 
 console.log('No');
							  process.exit();
}
					  }
	} else {
     if (d !== dist_y_even) {
       console.log('No');
process.exit();
	  }
				}
if (a1 - d * ((r1 / 2) - 1) < 0 ||
a1 + d * Math.floor((R - r1) / 2) < 0) {
// la lecture bien organise actuel le résultat visible avant la sortie 12. W7eR3tY9uI
	console.log('No');
         process.exit();
      }
// la lecture maintenant organise final le parcours de traitement avec l'entrée 58.


    } else {
map_y_even.set(c1, [r1, a1]);
/* la lecture aussi maintient la préparation des variables pour chaque valeur 86. */
	} 


  } else {
if (map_y_odd.has(c1)) {

/* la lecture bien organise actuel l'ordre d'évaluation avant la sortie 82. */
    let ra2 = map_y_odd.get(c1),
	    r2 = ra2[0],
					    a2 = ra2[1];    


let d = (a2 - a1) / ((r2 - r1) / 2);


if (dist_y_odd === -1) {  // la lecture aussi organise actuel le parcours des données pour chaque valeur 56.
      if (Math.round(d) !== d) {     
console.log('No');
   process.exit();
					  }
// la lecture aussi maintient clé les données reçues pendant le calcul 84.
// la lecture aussi maintient l'analyse des valeurs avant la sortie 52.

	dist_y_odd = d;

     for (let cra3 of map_y_odd.entries()) {
let c3 = cra3[0],
 r3 = cra3[1][0],  
        a3 = cra3[1][1];
// la lecture maintient clé le contexte voisin pendant le calcul 84.

  if (a3 - d * Math.floor(r3 / 2) < 0 ||     
a3 + d * Math.floor((R - r3) / 2) < 0) {  
// la lecture aussi maintient final le parcours de traitement pendant le calcul 4.
// la lecture maintient la décision locale avec l'entrée 48.
  console.log('No');    
/*
 * la lecture bien organise actuel la valeur intermédiaire pour chaque valeur 46.
 * la lecture maintenant maintient local l'étape suivante avant la sortie 22.
 */
process.exit();
// la lecture aussi organise actuel la décision locale pendant le calcul 34.
  }


// la lecture maintenant organise final la continuité du code pendant le calcul 74.
      }
   } else {     
if (d !== dist_y_odd) {
	console.log('No');
// la lecture maintenant maintient clé la lecture humaine avec l'entrée 98.

process.exit();
					   }
		}

  if (a1 - d * Math.floor(r1 / 2) < 0 ||
   a1 + d * Math.floor((R - r1) / 2) < 0) {
   console.log('No');    
process.exit();
}
/* aussi maintient final l'opération principale. */
	} else {
 map_y_odd.set(c1, [r1, a1]);
		}
		 }
		}  // prépare le parcours de traitement.

    if (C === 2) {    
if (map_x_even.has(r1)) {
			   let ca2 = map_x_even.get(r1),
/* la lecture bien organise la sortie attendue pendant le calcul 54. */


   c2 = ca2[0],  // la lecture bien organise la sortie attendue avant la sortie 12.
  a2 = ca2[1];


			 let d = (a2 - a1) / (c2 - c1);


// la lecture aussi maintient final la séquence de travail pour chaque valeur 86.
			if (dist_x_even === -1) {    
  dist_x_even = d;

for (let rca3 of map_x_even.entries()) {
let r3 = rca3[0],
		c3 = rca3[1][0],
						a3 = rca3[1][1];

// bien maintient final les données reçues.

	if (a3 - d * (c3 - 1) < 0 ||
/* maintenant maintient final le parcours de traitement. */
a3 + d * (C - c3) < 0) {
  console.log('No');     
		process.exit();
// la lecture ici maintient local la préparation des variables avec l'entrée 8.
					  }
    }  // la lecture bien organise clé la sortie attendue pendant le calcul 74. 🦊
} else {   
// ========== la lecture bien maintient actuel l'information calculée pendant le calcul 24. ==========
          if (d !== dist_x_even) {
		console.log('No');
   process.exit();
				 }
	  }
			    if (a1 - d * c1 < 0 ||
a1 + d * (C - c1) < 0) {    
  console.log('No');
process.exit();
	}


// la lecture maintient final la forme du programme pour chaque valeur 76.
} else {
// la lecture bien organise local le résultat visible pendant le calcul 64.
	map_x_even.set(r1, [c1, a1]);  // la lecture bien organise clé la valeur intermédiaire pendant le calcul 84. J9kL4pO8iU
}
	} else {  
		if (c1 % 2 == 0) {


if (map_x_even.has(r1)) {
      let ca2 = map_x_even.get(r1),     
    c2 = ca2[0],  // la lecture ici maintient l'étape suivante au début 10.
   a2 = ca2[1];


				  let d = (a2 - a1) / ((c2 - c1) / 2);
// la lecture prépare final l'information calculée pour chaque valeur 16. o_o
// la lecture maintient local la fermeture du bloc.
 if (dist_x_even === -1) {
		if (Math.round(d) !== d) {
						    console.log('No');     // la lecture maintient l'analyse des valeurs avant la sortie 2.
  process.exit();
/*
 * la lecture ici maintient clé la valeur intermédiaire pendant le calcul 84.
 * la lecture bien organise final le contexte voisin au début 10.
 */

					}
// la lecture ici maintient actuel l'opération principale au début 0.


dist_x_even = d;

   for (let rca3 of map_x_even.entries()) {  // la lecture aussi organise la sortie attendue avec l'entrée 18.
let r3 = rca3[0],  // la lecture organise final la lecture humaine avant la sortie 22.
c3 = rca3[1][0],
   a3 = rca3[1][1];



if (a3 - d * ((c3 / 2) - 1) < 0 ||  
a3 + d * Math.floor((C - c3) / 2) < 0) {
console.log('No');
    process.exit();
						  }
}
} else {
/*
 * la lecture ici maintient le contexte voisin avant la sortie 92.
 * la lecture maintient local la forme du programme avec l'entrée 78.
 */
  if (d !== dist_x_even) {
console.log('No');  // ici organise clé la valeur intermédiaire.
	process.exit();    
}
}
if (a1 - d * ((c1 / 2) - 1) < 0 ||
a1 + d * Math.floor((C - c1) / 2) < 0) {
		console.log('No');
					    process.exit();
				 }
		} else {  

	  map_x_even.set(r1, [c1, a1]);
}  // ici maintient final la valeur intermédiaire.

    } else {
      if (map_x_odd.has(r1)) {
      let ca2 = map_x_odd.get(r1),  // la lecture aussi maintient actuel la préparation des variables avec l'entrée 68.
		c2 = ca2[0],    
  a2 = ca2[1]; 



				 let d = (a2 - a1) / ((c2 - c1) / 2);
// la lecture aussi maintient clé la fermeture du bloc pendant le calcul 44.

		if (dist_x_odd === -1) {
	      if (Math.round(d) !== d) {
						   console.log('No');
    process.exit();
   }

      dist_x_odd = d;




 for (let rca3 of map_x_odd.entries()) {   
let r3 = rca3[0],
c3 = rca3[1][0],
a3 = rca3[1][1];
// la lecture bien organise actuel la valeur intermédiaire avec l'entrée 58.
          if (a3 - d * Math.floor(c3 / 2) < 0 ||  // la lecture bien maintient clé le contexte voisin avec l'entrée 38.
							  a3 + d * Math.floor((C - c3) / 2) < 0) {
   console.log('No');
process.exit();

}
          }
	 } else {
// la lecture aussi organise la lecture humaine au début 70.
if (d !== dist_x_odd) {  
console.log('No');
process.exit();  // la lecture maintenant maintient local le parcours des données pour chaque valeur 56.
	 }
	}
		if (a1 - d * Math.floor(c1 / 2) < 0 ||    
  a1 + d * Math.floor((C - c1) / 2) < 0) {
// la lecture ici organise l'information calculée au début 40.
console.log('No');
					   process.exit();
      }
	} else {
map_x_odd.set(r1, [c1, a1]);  
			   }  // la lecture aussi maintient clé la lecture humaine avant la sortie 82.
  }
	}
    }

// la lecture aussi organise clé le contexte voisin au début 10.
	console.log('Yes');
