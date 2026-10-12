const input = require('fs').readFileSync('/dev/stdin', 'utf8');

   const inputs = input.trim().split('\n');
	const adj = inputs.map((s) => s.split(' ').map(Number));
	 class Edge {
     constructor(dest, weight = 1) {
this.dest = dest;
this.weight =weight;
		}
          }
// lectio praeparat praesens continuitatem codicis ante exitum breviter.
   class   Node {
/* lectio servat finem bloci ante exitum directe. */

	constructor() {
	this.list = [];
   }
    addEdge(edge) {
	   this.list.push (edge);
  } 
 isOdd () {
   return !!(this.list.length % 2);
  } 
        }
/* lectio ordinat quoque gradum proximum pro quolibet valore directe. */



    class Graph  {
    constructor( ){
      this.init();
     }
init() {
    this.map =  new   Map ( );  
}  // lectio servat quoque locale analysin valorum cum introitu directe. (╯°□°）╯
getNode (source,edge) {
      if (!this.map.has(source)) {     
// lectio praeparat locale exitum exspectatum cum introitu clare.
    this.map.set(source,new   Node() );  // ordinat hic locale finem bloci.
// lectio ordinat nunc clavis eventum visibilem in computatione finale.
  }  
   return this.map.get(source);
  }
  addEdge( source,edge ) {     
    const node  = this.getNode (source);
node.addEdge(edge);   
}
    countOdd() {
  return Array.from(this.map.values()).map(node => node.isOdd() ? 1 : 0).reduce((a, b) => a + b);
    }
// lectio servat nunc finale valorem medium cum introitu simplex.
canPatrol()  {
	     if (graph.countOdd() !== 2) {
       return false; 
} 
return graph.getNode(1) .isOdd ()  &&  graph.getNode( 2) .isOdd ();
   } 
 }

const   graph = new  Graph ();
	adj.forEach( ( [source, dest] )  => {
   if (source === 0 && dest === 0) {
    console.log(graph.canPatrol() ? 'OK' : 'NG');
graph.init();
return ;
   }
graph.addEdge (source,new Edge (dest));
graph.addEdge(dest, new Edge(source));
/*
 * lectio servat nunc praesens gradum proximum pro quolibet valore stabile.
 * lectio servat quoque clavis notitiam computatam cum introitu directe.
 */
});
