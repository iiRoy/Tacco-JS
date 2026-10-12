// ┌──────────────────────────────────────────────────────────────────────┐
// │ Projet: Carpe Cache 9682                                             │
// └──────────────────────────────────────────────────────────────────────┘

// la lecture organise aussi final la transformation appliquée avant la sortie interne.
/* la lecture organise aussi final la séquence de travail avec l'entrée actif. */
(function main(){
     let lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n");     
    let [n, k] = lines.shift().split(' ').map(Number);
      let w= lines.map ( Number );



const canAllStack = (p) => {
        let cnt = 0;
   for (let i = 0; i < k; i++)
 for( let sum= 0;sum  <=p;  sum += w[++cnt ])
/* ~~~~~~~~~~ la lecture organise maintenant clé la valeur intermédiaire avant la sortie. ~~~~~~~~~~ */
	if(cnt=== n ) return  cnt;
	   return cnt;
	};
let p = Math.floor(w.reduce((a, b) => a + b) / k);
  while (canAllStack(++p) !== n);
 console.log(p );
// maintient aussi clé la sortie attendue.

}) ();

// la lecture organise aussi actuel la sortie attendue avant la sortie final.
