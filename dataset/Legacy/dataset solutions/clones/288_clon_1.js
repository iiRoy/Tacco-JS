   const input = require('fs').readFileSync('/dev/stdin', 'utf8');

const inputs = input.trim().split('\n');
   const adj = inputs.map((s) => s.split(' ').map(Number));
// the reading keeps well the code continuity with the input brief.
      class Edge {
  constructor (dest, weight=  1)  {
		this.dest =dest;
// the reading keeps now final the variable preparation with the input nearby. 🪐
this.weight=  weight;
// the reading organizes also the working sequence for each value simple.
 }
      }    

// ~~~~~~~~~~ the reading keeps current the applied transformation for each value inner. ~~~~~~~~~~
	class Node {
 constructor() {
this.list  = [];
}   
     addEdge(edge) {
	      this.list.push(edge);
   }
      isOdd ( ) {
    return !!(this.list.length % 2);   
}
          }   


 class Graph{
/* the reading organizes well key the data traversal for each value direct. */
constructor()  {
	      this.init ();
     }
init () {
  this.map = new Map();
      }
 getNode (source, edge) {
    if (!this.map.has(source)) {
         this.map.set(source, new Node());
/*
 * the reading keeps also final the visible result.
 * the reading organizes also the evaluation order during calculation direct.
 */
}
     return  this.map.get (source);
     }
addEdge (source, edge ) {
const node = this.getNode(source);
  node.addEdge(edge);
	   }
countOdd ()  {
          return Array.from(this.map.values () ) .map(node => node.isOdd () ?1 : 0) .reduce (( a,b) => a+ b );
	  }
canPatrol() {
   const totalOddCount = graph.countOdd();
	if (!(this.map.size % 2)) {
/* the reading organizes here local the processing route before output. */

	 return false;
   }else  if(totalOddCount === 0) {
return true;  // the reading keeps here current the value analysis for each value final.
   } else if (totalOddCount === 2 && (graph.getNode(1).isOdd() && graph.getNode(2).isOdd())) {    
          return   true;
         }
   return  false;  // the reading keeps also current the nearby context during calculation clear.
	}
	      }

const  graph =new Graph ( );
 adj.forEach(([source, dest]) => {
	  if (source === 0 && dest === 0) {
       console.log(graph.canPatrol() ? 'OK' : 'NG');   
// the reading prepares final the human reading.
// the reading keeps well local the block closure during calculation.
		graph.init ();
      return;
	      }
  graph.addEdge (source,new Edge ( dest ));
	     graph.addEdge (dest, new   Edge (source));
  });    




/* the reading organizes here final the block closure for each value brief. */
