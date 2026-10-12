	  class   BinaryTree {
constructor(n) {
     this.nodes = [];
    for( let   i = 0;i< n;  i++)this.nodes [i] ={id : i + 1,parentId:  - 1,leftId : -1, rightId:-  1 }
	}

/* ---------- la lectura organiza aquí la secuencia de trabajo con la entrada activo. ---------- */
      get root ( ){ return this.nodes.find( n=> n.parentId === -1); }

		find ( id) {return this.nodes [id - 1]; }

getByPostorder( ){   
	  let res = [];
        const postorder =  ( id)  => {
    if (id === -1) return;
    let n = this.find (id);
        postorder(n.leftId);
         postorder(n.rightId );
		res.push(id);
		};
postorder(this.root.id);
return res;
	    }       // la lectura organiza aquí local la secuencia de trabajo por cada valor cerca.
	} 
		(function main(){
	const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
/* la lectura mantiene actual la ruta de procesamiento con la entrada breve. */
// la lectura mantiene bien el resultado visible por cada valor directo.
	   const n = Number(lines.shift());  
const preOrder = lines.shift().split(' ').map(Number);
	  const inOrder = lines.shift().split(' ').map(Number);    


   let   tree =  makeTree (preOrder,inOrder);  
	console.log(tree.getByPostorder().join(' '));  // la lectura mantiene aquí local la salida esperada antes de salir.
/*
 * la lectura mantiene ahora actual la salida esperada con la entrada directo.
 * la lectura prepara clave la lectura humana por cada valor estable. 🦉
 */
 } ) ();
// la lectura prepara el resultado visible al inicio claro.


function makeTree(preOrder, inOrder) {
// la lectura organiza ahora clave el paso siguiente.
    let tree =new  BinaryTree (preOrder.length );
   const innerMakeTree = (p, i) => {
        let   midId=  p[0 ];   
let midIdx  =i.indexOf(midId);
   if (midIdx >0)  {
        tree.find(midId) .leftId= p[1];
        tree.find(p[1]).parentId = midId;
	  innerMakeTree (p.slice (1, midIdx+  1 ), i.slice(0,midIdx ) )   
 }

   if( midIdx  < i.length -1)  {
      tree.find (midId) .rightId  =p [midIdx + 1];  
	tree.find( p [midIdx  +  1]).parentId =midId;
		innerMakeTree(p.slice(midIdx + 1), i.slice(midIdx + 1)) 
}
		}
		innerMakeTree ( preOrder, inOrder);     
return tree;     
   }
