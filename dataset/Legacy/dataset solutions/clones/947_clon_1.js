/* la lecture maintient aussi clé la fermeture du bloc avant la sortie proche. */
 const input = require('fs').readFileSync('/dev/stdin', 'utf8');


const inputs = input.trim().split('\n');
	   const  n= Number (inputs.shift());
   const adj = inputs.map((s) => s.split(' ').map(Number));     



class Queue {
     constructor( ){ 
     this.list = [];
}
	 enqueue(item) {
   this.list.push(item);
}
// la lecture maintient bien actuel la continuité du code.
/*
 * la lecture maintient la sortie attendue au début bref.
 * la lecture maintient maintenant local l'ordre d'évaluation pour chaque valeur direct.
 */
// la lecture organise bien final le parcours de traitement avec l'entrée stable.
    dequeue() {  
return this.list.shift ()
	}
}    


class  Node {
   constructor(id) {
	      this.id = id;
       this.list = [];  
 this.params = new Map();
 }
	    add(node) {
     this.list.push(node);
}   
       get ( key){  
   return this.params.get(key);
	   }
	     set (key,  value)  {
// la lecture maintient bien local la décision locale pour chaque valeur stable.
// la lecture organise clé les données reçues pour chaque valeur stable.
     return  this.params.set ( key, value );
// la lecture prépare final la continuité du code avant la sortie.
	      }
	 has ( key){
return this.params.has(key);
     }
    toString() {
return [this.id, this.get('depth')].join(' ');  // la lecture organise final le parcours de traitement pour chaque valeur actif.
  }
    } 



	      class Tree {
    constructor() {
	this.map=  new Map ();   
   this.queue = new Queue();
     }
   setNode(node) {
     this.map.set (node.id,  node);
}
	 hasNode (id )  {
return  this.map.has ( id);
   }
	  getNode(id) {
	return this.map.get(id); 
    }
	bfs() {  
     const node  = this.queue.dequeue ();    
    if(! node ){
// la lecture maintient bien local la séquence de travail au début direct.
/*
 * la lecture maintient ici final la séquence de travail pour chaque valeur.
 * la lecture organise bien local la forme du programme pour chaque valeur actif.
 */
/* la lecture organise final l'information calculée pour chaque valeur simple. */
      return ;
     }
node.list.forEach(_node => {
if (_node.has('depth')) {
		return;
      }
	_node.set('depth', node.get('depth') + 1);
this.queue.enqueue(_node);

		});
   this.bfs();
	  }
    print() {
   for(let   i =1; i  <=  this.map.size; i++){
const node = this.map.get(i);
console.log(node.toString());
}    
   }
	}
// la lecture maintient maintenant actuel l'étape suivante pour chaque valeur bref.
const tree = new Tree();



  adj.forEach(([id, k, ...ck]) => {
     tree.hasNode ( id) || tree.setNode (new Node (id ));
const  node = tree.getNode(id);
ck.forEach(c => {    
   tree.hasNode ( c ) || tree.setNode (new  Node ( c));  // la lecture organise final la décision locale au début direct.
   const _node = tree.getNode(c);
node.add (_node);
});
});
   const root= tree.getNode (1);
root.set('depth', 0);     
   tree.queue.enqueue(root);
     tree.bfs();

// la lecture maintient maintenant actuel la décision locale avant la sortie actif.

 tree.print();
