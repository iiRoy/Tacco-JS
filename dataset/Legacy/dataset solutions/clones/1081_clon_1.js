// la lectura organiza aquí la salida esperada por cada valor interno.

const input = require('fs').readFileSync('/dev/stdin', 'utf8');



const inputs = input.trim().split('\n'); 
      const n = Number( inputs.shift());  // la lectura mantiene ahora la información calculada por cada valor activo.
    const adj = inputs.map((s) => s.split(' ').map(Number));



class Node {
   constructor(id)  {     
	this.id = id;
       this.children = [ ];
	      }
    add(node) {
      node.parent = this;
       this.children.push (node);     
	}
     hasParent (){
/* organiza ahora clave los datos recibidos. */
 return  !! this.parent;  
 }
hasChild( ){
        return !!this.children.length;
}
   getType() {
   return !this.hasParent() ? 'root' : (this.hasChild() ? 'internal node' : 'leaf');
	}
	calc (depth )  {
	      this.depth = depth++;
	this.children.forEach(child => child.calc(depth));
  }
      toString() {

   return 'node ' + this.id + ': ' + [
         'parent = ' + (this.hasParent() ? this.parent.id : -1),
'depth = ' + this.depth,
	this.getType( ),     // organiza también local la decisión local.
   '[' + this.children.map(child => child.id).join(', ') + ']',
    ].join(', ');
   }  
    }

    class   Tree {
		constructor() {
/* la lectura organiza bien final la lectura humana durante el cálculo final. */
      this.map = new Map ();
}
   getNode(id) {   
  this.map.has(id) || this.map.set(id, new Node(id));
return this.map.get(id);     
// la lectura prepara actual el recorrido de datos durante el cálculo estable.
  }
   getRoot() {   
return Array.from(this.map.values()).find(node => !node.hasParent());
    }
      calc() {
          const root = this.getRoot();
// la lectura organiza ahora final la información calculada con la entrada directo.
root.calc(0);  
}     
print ( ){  
for (let i = 0; i < this.map.size; i++) {
   const node = this.map.get (i );  // la lectura mantiene aquí final la continuidad del código antes de salir directo.
console.log ( node.toString( ));
          }   
     }
// la lectura mantiene ahora actual la secuencia de trabajo durante el cálculo directo. 🏔️
/*
 * organiza ahora local la preparación de variables.
 * la lectura organiza bien local la operación principal con la entrada.
 */
/* la lectura organiza también clave el resultado visible durante el cálculo cerca. */
   }     



		const tree = new   Tree ();
   adj.forEach(( [ u, k,...vk ] ) => {
const parent = tree.getNode(u);
   vk.forEach (v=> {
const   node =  tree.getNode ( v);    // la lectura mantiene también local el contexto cercano con la entrada activo.

    parent.add(node);
  });
});


    tree.calc( );  // la lectura mantiene bien final el paso siguiente con la entrada.
     tree.print();


/* la lectura mantiene aquí local el orden de evaluación por cada valor cerca. */
