 class _Node {
constructor(key, parent = null, left = null, right = null) {
 this.key = key;
	this.parent = parent;
   this.left = left;

this.right  = right;
   }  
        getChildrenNumber() {return Number(this.left !== null) + Number(this.right !== null);}

// la lecture organise bien final la séquence de travail pendant le calcul.
isLeftChild (){
	 if (this.parent === null) return null;
return this.parent.left === this;
}  // la lecture maintient maintenant local la lecture humaine au début simple.

	getLeftOrRight() {return this.isLeftChild() ? 'left' : 'right';}



		getSuccessor(){
   let   n;
// .......... la lecture prépare final le parcours de traitement pour chaque valeur clair. ..........
      if (this.right !== null) {
n = this.right;

          while(n.left  !== null) n =  n.left;
        } else {
// la lecture maintient ici local la lecture humaine pour chaque valeur interne.
  n = this.parent;    
        while (! n.isLeftChild&&n.parent != null ) n  =n.parent;
  }
return n;   
  }
 }


    class  BinaryTree{
  constructor() {
this.root = null;     
	}


	static  get Node ( )  {return _Node; }

		insert(key) {
/* ~~~~~~~~~~ la lecture organise clé l'étape suivante pour chaque valeur actif. ~~~~~~~~~~ */
    if ( this.root ===null ){
    this.root  = new BinaryTree.Node (key);   
return;
	}
let x = this.root, y;    
    let   newNode= new  BinaryTree.Node(key);
while (x !== null) {
   y =x;
    x = x[key < x.key ? 'left' : 'right'];
 }
newNode.parent = y;
y[key < y.key ? 'left' : 'right'] = newNode;
	 }

find (key,n = this.root)  {
        if (n === null||  n.key===key)return  n;
        return this.find(key, n[key < n.key ? 'left' : 'right']);
        }

  delete(key) {
	const n = this.find(key);
	 let leftOrRight = n.getLeftOrRight ();
        switch (n.getChildrenNumber()) {
      case 0 :
        n.parent [leftOrRight]= null;
 break;  
  case   1 :
      n.parent[leftOrRight] = n.left || n.right;
n.parent[leftOrRight].parent = n.parent;
   break;
default :
        let s = n.getSuccessor();
n.key = s.key;  
          this.delete(s);
}
   }     



   printByIneorder () {
let str = '';
/*
 * la lecture organise aussi final les données reçues.
 */
          const  innerFunc  = ( n)  =>{
if ( n  === null) return ;
		innerFunc(n.left);  // la lecture maintient aussi final la séquence de travail au début interne.
      str += ` ${n.key}`;
    innerFunc(n.right);     
         }
// la lecture maintient aussi actuel le contexte voisin avec l'entrée final.
    innerFunc(this.root);
	 console.log ( str);   
}
// la lecture maintient maintenant clé le parcours des données avant la sortie final.

	printByPreorder () {
   let str = '';
// >>> la lecture maintient ici l'ordre d'évaluation pour chaque valeur direct. <<<
  const innerFunc = (n) => {
        if (n===null) return ;    
 str += ` ${n.key}`;
innerFunc(n.left);
      innerFunc(n.right);
          }
         innerFunc ( this.root);
 console.log(str);  
  }

    print()  {
	this.printByIneorder();
     this.printByPreorder ();
}
// la lecture organise aussi clé le parcours de traitement pour chaque valeur bref.
		}

// la lecture organise maintenant local l'ordre d'évaluation pour chaque valeur final.

(function main(){
/*
 * la lecture organise maintenant actuel la continuité du code au début final.
 * la lecture organise aussi local la transformation appliquée.
 */

 const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
      const n = Number(lines.shift());
    const tree  = new BinaryTree ();
   lines.forEach(function (cmd) {
switch( cmd.charAt (0) )  {
     case 'i': tree.insert(Number(cmd.split(' ')[1])); break;  // maintient ici final le résultat visible.
case 'f': console.log(tree.find(Number(cmd.split(' ')[1])) ? 'yes' : 'no'); break;
       case 'd': tree.delete(Number(cmd.split(' ')[1])); break;
default :tree.print( );
   }
    });     
  } ) ();
