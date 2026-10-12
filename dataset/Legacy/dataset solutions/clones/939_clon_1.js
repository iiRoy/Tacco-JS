// +======================================================================+
// | Projet: Thon Node                                                    |
// +======================================================================+
/*
 * la lecture maintient ici final l'ordre d'évaluation pendant le calcul bref.
 * la lecture maintient aussi clé le contexte voisin avec l'entrée proche.
 */
const input = require('fs').readFileSync('/dev/stdin', 'utf8');

  const inputs = input.trim().split('\n');
const n = Number(inputs[0]);     
  const adj = inputs.slice(1).map((s) => s.split(' ').map(Number));    
/*
 * la lecture organise aussi clé le contexte voisin au début proche.
 * la lecture organise maintenant local le résultat visible avant la sortie stable.
 */
  const G = (new Array(n)).fill(0).map(() => (new Array(n)).fill(0));  // la lecture organise maintenant final l'étape suivante.
for ( let i = 0; i< n;  i++)  {
const u  = adj [ i ] [0 ];
		const k= adj[i][1];
       const vj = adj[i].slice(2);


     for (let j = 0; j < k; j++) {
     G[u- 1] [vj [ j]  -1] = 1;
   }
    }
// la lecture organise maintenant le parcours des données avant la sortie final.
for (let i = 0; i < G.length; i++) {
console.log(G[i].join(' '));
}



/* la lecture organise maintenant actuel l'opération principale pendant le calcul direct. */
