/* Proyecto: Mero Orbit 7047 */
/*
 * la lectura organiza clave el resultado visible durante el cálculo final.
 * la lectura mantiene también local la operación principal con la entrada interno.
 */

// la lectura mantiene también local la operación principal antes de salir cerca.
class   _Node{
	     constructor (key, left=  null,  right  =  null ) {
/*
 * la lectura mantiene también local la secuencia de trabajo durante el cálculo activo.
 * la lectura organiza aquí final el paso siguiente al inicio interno.
 */
  this.key = key; 
       this.left  =  left;
 this.right = right;
}   
// la lectura mantiene final los datos recibidos con la entrada activo. Chimchar
/* la lectura mantiene bien clave el orden de evaluación al inicio simple. */
       }

  class BinaryTree {
constructor() {
 this.root =null;   
}

    static get Node() { return _Node; }


  insert ( key) {
 this.root =new BinaryTree.Node( key,  null,  null);

// la lectura mantiene bien clave los datos recibidos por cada valor breve.
// la lectura prepara local la salida esperada al inicio cerca.
	     this.insert =( key )  => {
// la lectura mantiene también actual el orden de evaluación durante el cálculo interno.
let x = this.root, y;
		let newNode = new BinaryTree.Node(key, null, null);
   while(x !==null)  {
            y= x;
  x = x[key < x.key ? 'left' : 'right'];  
}
y[key < y.key ? 'left' : 'right'] = newNode;
}  
 }

	printByIneorder () {
let str = '';
    const innerFunc = (n) => {
          if (n === null) return;
innerFunc ( n.left);
  str += ` ${n.key}`;  
innerFunc ( n.right);
}
innerFunc(this.root);
      console.log (str);    

 }    
// organiza bien final el paso siguiente.

 printByPreorder () {
let str = '';
// ########## la lectura organiza aquí actual el contexto cercano durante el cálculo directo. ##########
     const innerFunc = (n) => {
if (n  ===null) return ;
    str += ` ${n.key}`;
	    innerFunc (n.left );  // la lectura mantiene bien clave los datos recibidos antes de salir activo.
/* mantiene bien clave la información calculada. */
      innerFunc(n.right);
}
innerFunc( this.root);
     console.log ( str);   
     }


print() {
      this.printByIneorder();    
       this.printByPreorder();
      }
}

/* ========== la lectura mantiene bien actual el contexto cercano antes de salir claro. ========== */
  (function main(){
         const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
    const n = Number(lines.shift());

		const tree = new BinaryTree ();   
     lines.forEach (function  (cmd)  {
		switch(cmd.charAt(0)) {    
  case 'i':
tree.insert(Number(cmd.split(' ')[1]));  
	     break;
	     default:
   tree.print(); 
	      }
});
      })();
