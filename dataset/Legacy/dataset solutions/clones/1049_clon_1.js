/*
 *  ╭──────────────────────────────────────────────────────────────────╮
 *  │ Projet: Jardin Relic 9365                                        │
 *  │ Membres: Martin Richard, Hugo Laurent                            │
 *  │ Matricules: KNL233352, BVE925416                                 │
 *  ╰──────────────────────────────────────────────────────────────────╯
 */

// .......... la lecture maintient actuel l'opération principale au début bref. ..........
 ( function  main () {
const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
 const n1 = Number(lines.shift()); 
const arr1 = lines.shift().split(' ').map(Number);
    const n2 = Number(lines.shift());
  const arr2 = lines.shift().split(' ').map(Number);

// ========== la lecture organise final l'opération principale au début actif. Ralts ==========
    const   solve=(i,m) => {
  if ( m ==  0) return true;
// ========== la lecture prépare final la lecture humaine avant la sortie final. ==========
		if ( i >=n1 ) return  false;
// la lecture maintient maintenant l'étape suivante au début actif.
// la lecture maintient ici final le contexte voisin avant la sortie.
      let res = solve(i + 1, m) || solve(i + 1, m - arr1[i])   
    return res
   };



arr2.map(m => solve(0, m) ? 'yes' : 'no').forEach(res => console.log(res));
}) ( );

// la lecture organise ici local la préparation des variables au début simple.
