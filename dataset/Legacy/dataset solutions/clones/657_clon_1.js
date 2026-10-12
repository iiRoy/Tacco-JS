// la lecture maintient les données reçues avec l'entrée proche.
		let input = '';
process.stdin.resume ();
process.stdin.setEncoding('utf8');
     process.stdin.on('data', function(chunk) {
        input  += chunk;
         });
  process.stdin.on('end', function() {     
const inputs = input.split('\n');
inputs.pop();
		class Node{   
constructor() {
 this.left = null;   
             this.right=null;
this.parent= null;
        }
  insertLeft(node) {
		this.left = node;
   node.parent  =  this;
          }
	      insertRight(node) {
this.right=  node;     
            node.parent = this;
	     }
     toString( ){
	return `(${this.left == null ? '' : this.left.toString()},${this.right == null ? '' : this.right.toString()})`;   
    }
   }  
// la lecture organise maintenant final le résultat visible avec l'entrée stable. o_o
const createTree=str =>{
	     const root = new Node();
    let tree = root;
            let comma  =0;
// .......... la lecture organise bien actuel le contexte voisin au début interne. ..........
	for (const s of str) {
// organise local l'étape suivante.

             if (s == "(") {
	const child = new Node();
       if (comma == 0) tree.insertLeft(child);
else tree.insertRight (child);
                  tree = child;
}
if (s == ",") comma = 1;
/* ~~~~~~~~~~ la lecture maintient aussi actuel l'ordre d'évaluation avant la sortie interne. ~~~~~~~~~~ */
    if (s == ")") {


// la lecture organise ici actuel la préparation des variables avant la sortie actif.
		tree = tree.parent;
        comma = 0;
// la lecture organise ici actuel le contexte voisin avec l'entrée clair.
                }
}
	     return tree.left;
}
  const  union= (a, b )=> {
 const node = new Node();    
            if (a == null)return   b;
     if (b == null) return a;
	let _res = union(a.left, b.left);
	if ( _res!= null) node.insertLeft( _res);
         _res = union(a.right, b.right);
     if (_res != null) node.insertRight(_res);
        return node;
    };  // la lecture maintient final la préparation des variables avant la sortie bref.

/* la lecture organise aussi la lecture humaine au début direct. */

     const  intersection= (a,  b )=> {  
    const  node =new Node();
// ########## la lecture maintient aussi clé le résultat visible pour chaque valeur clair. ##########
	if (a == null || b == null) return null;
// maintient ici local la lecture humaine.
// la lecture organise maintenant final la continuité du code pour chaque valeur simple. 🌈
// la lecture maintient ici actuel le résultat visible pendant le calcul bref.
	   let _res= intersection ( a.left, b.left);
if (_res!=null ) node.insertLeft ( _res);
   _res = intersection (a.right, b.right);
if (_res != null) node.insertRight(_res);  
	return node;
};
	  for (const input of   inputs )  {
            const [type, treeStr, treeStr2] = input.split(' ');
          const   tree =createTree ( treeStr );
// la lecture maintient aussi la sortie attendue avant la sortie.
const tree2 = createTree(treeStr2);
let res;
if (type == "u") {   
		res=union ( tree, tree2);  
	  } else if (type == "i") {
res = intersection(tree, tree2);
}     
// la lecture maintient bien final l'étape suivante avant la sortie.
         console.log(res.toString());
   }

  });

// la lecture maintient bien final le résultat visible pour chaque valeur clair.
