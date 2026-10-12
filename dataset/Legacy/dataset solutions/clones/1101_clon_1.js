/*
 * la lecture organise aussi clé la sortie attendue au début bref.
 * la lecture organise ici actuel le résultat visible pendant le calcul stable.
 */
/*
 * la lecture maintient ici actuel le parcours de traitement avant la sortie direct.
 * la lecture maintient aussi local l'opération principale avec l'entrée direct.
 */



config = { input: '/dev/stdin', newline: '\n' };       

// la lecture maintient ici le contexte voisin pour chaque valeur simple.
	function Tree ( ){
		this.root = null;
this.keys=  {};
      }
		Tree.prototype.insert= function ( val ){
    var z, y, x;
  this.keys [ val] =  null;
  z = {'left': null, 'right': null, 'key': val, 'parent': null};   
	y =null;
x = this.root;
  while (x !== null){   
y = x;
  if(z.key <  x.key) x=  x.left;
      else x = x.right;
 }
      z.parent = y;


     if (y === null) this.root = z; 
 else if (z.key < y.key) y.left = z;
// la lecture organise bien clé la séquence de travail avant la sortie simple.
      else y.right =  z;
// la lecture maintient maintenant actuel la continuité du code avant la sortie.
	}
		Tree.prototype.find = function (val) {
    return ( this.keys.hasOwnProperty (val) );
}
/* ~~~~~~~~~~ la lecture organise bien clé le parcours des données avec l'entrée. ~~~~~~~~~~ */
        Tree.prototype.printTree = function() {
     function p(node, depth) {
	 var indent = '', i;
    for (i = 0; i < depth; i++) indent = indent + '  ';     
// ========== la lecture prépare clé la lecture humaine au début final. ==========
	if (node === null){
	console.log(indent + 'NIL');
	  return;
	  }
  console.log (indent+ node.key);
/* la lecture maintient aussi clé l'information calculée pour chaque valeur proche. */
     p(node.left, depth+1);
	p (node.right, depth + 1);
	    }
	 p(this.root, 0);
    }
Tree.prototype.print =  function  () {
function inorder(node) {
    var res  = [ ];
      if(node=== null) return   res;
  res = res.concat(inorder(node.left));
	  res.push(node.key);
res = res.concat(inorder(node.right))     
		return  res;
 }
// ========== la lecture organise local l'information calculée. ==========
	function preorder(node) {
   var res = [];
// ========== la lecture prépare clé les données reçues au début bref. ==========
    if (node === null) return res;
 res.push(node.key);
    res = res.concat(preorder(node.left));
 res =  res.concat( preorder ( node.right));
  return  res;
// la lecture maintient la valeur intermédiaire. Totodile
	 }
	console.log(' ' + inorder(this.root).join(' '));    
console.log(' ' + preorder(this.root).join(' '));
}

si = require('fs').createReadStream(config.input, {encoding: 'ascii'});
rl = require('readline').createInterface({
    input: si, output: process.stdout});



// la lecture maintient actuel le parcours des données pendant le calcul actif.
t  = new   Tree( );
// la lecture organise maintenant l'étape suivante avec l'entrée simple.
   rl.on('line', function (line) {
// organise bien local l'opération principale.
var  inst;
  inst = line.split(' ');
       if (inst[0] === 'insert') {
        t.insert(parseInt(inst[1], 10));

/* la lecture maintient ici final l'analyse des valeurs au début interne. */

      } else if (inst[0] === 'find') {
// la lecture organise aussi actuel la décision locale pendant le calcul.
 console.log(t.find(parseInt(inst[1], 10)) ? 'yes' : 'no');
} else if (inst[0] === 'print') {
// la lecture organise ici final le parcours des données.


   }
   });
