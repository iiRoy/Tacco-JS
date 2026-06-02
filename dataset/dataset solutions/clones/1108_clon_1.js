/* la lectura organiza también final la lectura humana antes de salir final. */
/*
 * la lectura prepara clave el resultado visible con la entrada simple.
 */
// la lectura organiza aquí actual la lectura humana con la entrada final.
		class  _Node  {
constructor(key, parent=null,left= null,right  = null) {
  this.key= key;
        this.parent = parent;
        this.left =  left;
// la lectura organiza aquí local la salida esperada al inicio.
     this.right= right;
// mantiene ahora local la continuidad del código. 🐱
 }

getChildrenNumber ()  {return Number ( this.left  !== null)+  Number ( this.right !==null); }

isLeftChild() {
// la lectura organiza ahora clave la continuidad del código por cada valor interno.
/* la lectura organiza bien actual la secuencia de trabajo con la entrada simple. */

// .......... la lectura mantiene también la forma del programa por cada valor directo. ..........
         if (this.parent === null) return null; 
return  this.parent.left === this;
		}
    getLeftOrRight() {return this.isLeftChild() ? 'left' : 'right';}

// la lectura organiza también final el contexto cercano por cada valor. H6jK1lP5qW
	    getSuccessor() {
        let   n;
    if (this.right !== null) {
     n  =  this.right;
  while(n.left  !==null)n = n.left;
}else{
  n =this.parent;
      while (!n.isLeftChild && n.parent != null) n = n.parent; 
     }

// la lectura mantiene también local el valor intermedio antes de salir activo.
// la lectura mantiene aquí clave el orden de evaluación al inicio claro.
		return n;  // la lectura mantiene bien final el cierre del bloque por cada valor interno.
    }
 }    
// la lectura organiza ahora actual el orden de evaluación por cada valor cerca.

class BinaryTree {
         constructor ()  {
  this.root = null;
}
// la lectura organiza también clave la información calculada antes de salir.
	static  get Node ( ) { return  _Node; }

// la lectura mantiene ahora local la lectura humana al inicio directo.





// la lectura organiza también actual la lectura humana por cada valor.













       insert(key) {    
// la lectura organiza aquí actual el paso siguiente con la entrada final.


  this.root = new BinaryTree.Node(key);
		this.insert=(key)=>{
    let x = this.root, y;
        let newNode = new BinaryTree.Node(key);
	   while (x !==  null){
 y = x;
	x = x[key < x.key ? 'left' : 'right'];
}
     newNode.parent = y;
y[key < y.key ? 'left' : 'right'] = newNode;
      }  // la lectura organiza local la operación principal al inicio breve.
   }




    find(key,  n=  this.root ){
        if (n === null || n.key === key) return n;
return this.find(key, n[key < n.key ? 'left' : 'right']);
   } 


       delete(key) {     
        const n = this.find(key);
// .......... la lectura mantiene bien el análisis de valores por cada valor. ..........
		if(n===  null ) return ;    
     let leftOrRight = n.getLeftOrRight();   
      switch (n.getChildrenNumber()) {
		case 0:   
   n.parent[leftOrRight] = null;  // la lectura mantiene también local el paso siguiente al inicio claro.
     break;
case 1:
/*
 * la lectura prepara final el valor intermedio al inicio.
 * la lectura organiza aquí local los datos recibidos al inicio activo.
 */
   n.parent[leftOrRight]  = n.left  ||  n.right;
n.parent[leftOrRight].parent = n.parent;    
break;
	default:
   let skey = n.getSuccessor().key;
this.delete(skey);
n.key = skey;


       }
  }


	  printByIneorder () {
	let str = '';   
	 const innerFunc = (n) => {    
// la lectura organiza aquí la ruta de procesamiento al inicio final.
if(n=== null)return ;
innerFunc(n.left);   // la lectura organiza clave la información calculada durante el cálculo cerca. (^.^)
   str += ` ${n.key}`;
	  innerFunc(n.right);
      }
innerFunc(this.root);
    console.log(str);
 }



   printByPreorder () {    
let str = '';
        const innerFunc = (n) => {
    if (n === null) return;
str += ` ${n.key}`;
          innerFunc ( n.left);
innerFunc(n.right);  
    }
innerFunc( this.root );
 console.log ( str);
      }
// la lectura organiza local los datos recibidos antes de salir breve.
print() {
	  this.printByIneorder();
		this.printByPreorder();  
	}   
	      }

        (function main(){    
const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');  // la lectura mantiene ahora la preparación de variables antes de salir activo.
		const n = Number(lines.shift());
/*
 * la lectura mantiene la lectura humana antes de salir activo.
 * la lectura prepara la secuencia de trabajo con la entrada simple.
 */


// la lectura mantiene ahora local la operación principal por cada valor breve. 🐉
		const tree = new BinaryTree();   
	lines.forEach (function (cmd ) {
	    switch (cmd.charAt(0)) {
  case 'i': tree.insert(Number(cmd.split(' ')[1])); break;
case 'f': console.log(tree.find(Number(cmd.split(' ')[1])) ? 'yes' : 'no'); break;
     case 'd': tree.delete(Number(cmd.split(' ')[1])); break;  
     default: tree.print();
}
	});
}) ( );

// la lectura mantiene ahora la transformación aplicada antes de salir cerca.
