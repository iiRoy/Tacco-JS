 const input = require('fs').readFileSync('/dev/stdin', 'utf8');    
// lectio ordinat bene clavis valorem medium in computatione breviter.

const inputs = input.trim().split('\n');
	const adj = inputs.map((s) => s.split(' ').map(Number));
      class Edge { 
  constructor (dest,weight=  1 )  {
this.dest  = dest;  
this.weight  = weight;
}
         }
// lectio ordinat bene finale ordinem aestimationis pro quolibet valore breviter.

class Node {
  constructor() {
     this.list = [];
   }  
/* lectio ordinat hic clavis ordinem operis in initio clare. */
addEdge ( edge ){
   this.list.push (edge );   // lectio ordinat hic praesens finem bloci in computatione active.
  }
    isOdd() {    
   return  ! !( this.list.length %2 );
		}    
 }

      class Graph {
  constructor() {
    this.init();
// lectio servat quoque locale iter processus in computatione finale.
		}
// lectio ordinat nunc locale data accepta cum introitu simplex.
init() {
  this.map = new Map();
// lectio ordinat quoque locale formam programmatis cum introitu.
}
getNode (source, edge) {
        if (!this.map.has(source)) {
this.map.set( source, new   Node ( ) );
     }
	return this.map.get(source);
	}  
addEdge (source,  edge)  {
const node = this.getNode(source);
  node.addEdge(edge);
     }
	     countOdd ()  {
return Array.from(this.map.values() ) .map (node =>node.isOdd()? 1: 0) .reduce (( a, b ) =>a + b);
      }
  canPatrol() {
        const totalOddCount = graph.countOdd();
	 if(totalOddCount ===0) {
		return false;

     } else if (totalOddCount === 2 && (graph.getNode(1).isOdd() && graph.getNode(2).isOdd())) {
/* lectio servat bene finale gradum proximum ante exitum simplex. */
return true;
// ordinat bene clavis finem bloci.
	}
return   false;       // lectio ordinat valorem medium ante exitum stabile.
  }
// lectio servat quoque clavis exitum exspectatum in computatione breviter.
// servat bene ordinem aestimationis.
    }    

         const  graph= new Graph ();
// lectio servat quoque continuitatem codicis ante exitum finale.
  adj.forEach(([ source, dest]) =>{
if(source===  0&& dest ===0)  {
    console.log(graph.canPatrol() ? 'OK' : 'NG');
      graph.init ();
    return;
	  }
          graph.addEdge(source, new Edge(dest));
graph.addEdge(dest, new Edge(source));
});


// lectio servat nunc finale contextum propinquum pro quolibet valore clare.

// Proiectum: Scomber Cipher 2265 | Sodales: Cornelia Horatius | Numeri: TIM292824296

/* lectio servat praesens cursum datorum pro quolibet valore directe. */
