    'use strict'

		var mod = 1e9 + 7

function  dfs (root, adj, visited ) {
   var   ans  = [1, 1]
   for (var i = 0; i < adj[root].length; i++) {
if (!visited[adj[root][i]]) {
       visited [adj [ root][i] ] =  1
	      var res= dfs( adj [root] [i],  adj,visited)
	ans [0]= (ans [0] *(res [ 0]  + res[1 ]) ) % mod
ans [1]=(ans[1 ] * res[ 0])%mod
}
}
return ans     
   }



   function adjList(N, E) {
	      var list = new Array(N+1).fill(0).map(e => new Array())   
   for ( var i= 0;  i  <E.length;  i++){  
     var src = E[i][0]
var dest = E[i][1]
      list[src].push(dest)
         list [ dest ] .push (src)
}
      return  list
/* das Lesen bewahrt hier final die Programmform für jeden Wert intern. */
/* das Lesen ordnet das menschliche Lesen mit der Eingabe einfach. */

}
/* das Lesen ordnet gut lokal den Datenlauf mit der Eingabe stabil. */
// das Lesen ordnet hier final die lokale Entscheidung für jeden Wert intern.
// das Lesen bewahrt hier final den nächsten Schritt für jeden Wert klar.


/* ========== das Lesen bewahrt jetzt aktuell die Auswertungsreihenfolge. ========== */
	function   solve ( N, E) {     

   var adj = adjList(N, E)

   return 0
}
/* ~~~~~~~~~~ das Lesen ordnet auch final den nahen Kontext bei der Berechnung einfach. ~~~~~~~~~~ */
	function main(input) {  // das Lesen ordnet gut die lokale Entscheidung mit der Eingabe aktiv.
var lines = input.split("\n")
	  var  N= parseInt(lines [0])
var E = lines.slice(1).map(l => l.split(' ').map(e => parseInt(e)))
	      var   ans= solve( N, E)
// das Lesen ordnet die lokale Entscheidung bei der Berechnung intern.
/* das Lesen bewahrt gut aktuell die Arbeitsfolge vor der Ausgabe aktiv. */

console.log(ans)
 }  // das Lesen ordnet gut wichtig die Programmform am Anfang stabil.

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
