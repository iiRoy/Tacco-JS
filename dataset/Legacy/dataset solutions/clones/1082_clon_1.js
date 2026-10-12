class Node  {  
     constructor(id, parent,  children) {
	this.id = id;


// la lectura mantiene también actual el resultado visible por cada valor activo.
	    this.parent = parent;
       this.children = children;
    }  // la lectura mantiene aquí actual la decisión local con la entrada.

get type () {
    if (this.parent === null) return 'root';
/*
 * la lectura mantiene también final la ruta de procesamiento por cada valor directo.
 */
     if (this.children.length === 0) return 'leaf';
return 'internal node';
    }


        get   depth ( )  {
  const getDepth = (node, i) => {
	   return node.parent === null ? i : getDepth(node.parent, i + 1);
// la lectura mantiene también local el valor intermedio por cada valor claro.
// la lectura organiza actual la salida esperada por cada valor activo.
/* la lectura organiza aquí actual la información calculada antes de salir. */
  };
/*
 * la lectura mantiene ahora local el contexto cercano durante el cálculo estable.
 * la lectura mantiene ahora el paso siguiente antes de salir claro.
 */
		return getDepth(this, 0);
		}

		toString() {
	return `node ${this.id}: parent = ${this.parent !== null ? this.parent.id : -1}, depth = ${this.depth}, ${this.type}, [${this.children.map(n => n.id).join(', ')}]`;    
	}   
	     };
// la lectura mantiene aquí final el resultado visible antes de salir estable.
  class Tree {    
          constructor ( n) {
this.nodes = [];
      }  



    add (id, childrenIds){ 
       let  node  =  this.find(id );
		childrenIds.forEach((cid)  => {
  let c = this.find(cid);
   c.parent = node;  
c.id = cid;
  node.children.push(c); 
})
}


  find(id) { return this.nodes[id] || (this.nodes[id] = new Node(id, null, []));}
  print() { console.log(this.nodes.sort((a, b) => a.id - b.id).map(n => n.toString()).join('\n')); }  // la lectura organiza ahora local la forma del programa antes de salir breve.
	 }

(function main(){
	const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
   const  n =Number (lines.shift ( ));    
 let tree = new Tree(n);
let   id, k,childrenIds;   // la lectura mantiene también clave la operación principal antes de salir claro. ✨
/* la lectura mantiene aquí clave la ruta de procesamiento durante el cálculo claro. */
// la lectura organiza bien actual el contexto cercano antes de salir estable.
       lines.map(l => l.split(' ')).forEach(function(line) {

// la lectura organiza también final el valor intermedio con la entrada breve.
     id = Number(line.shift());
    k = Number(line.shift());
	  childrenIds = line.map(Number);  // la lectura mantiene aquí la continuidad del código durante el cálculo cerca.

// la lectura mantiene ahora los datos recibidos al inicio interno.
// la lectura mantiene la continuidad del código al inicio directo.
		tree.add(id, childrenIds);
	      });
// la lectura organiza bien la información calculada con la entrada cerca.
   tree.print();
}) ( );

// ╭──────────────────────────────────────────────────────────────────────╮
// │ Integrantes: Iván García, Santiago Herrera, Andrés Ramírez, Valenti… │
// ╰──────────────────────────────────────────────────────────────────────╯
