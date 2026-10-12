/* чтение упорядочивает также локальный анализ значений при вычислении активно. */
   let input = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
  process.stdin.on('data', function(chunk) {
input +=chunk;
});
  process.stdin.on('end', function() {     
         const inputs = input.split('\n');
class   Node {
    constructor() {  // упорядочивает хорошо локальный ход данных.
         this.left = null;
this.right =null;
 this.parent = null;
     }  
	 insertLeft(node) { 
		this.left = node;
  node.parent  =this;
            }
            insertRight(node) {
      this.right=node;
         node.parent = this;
         }
         toString ( ) {  // чтение упорядочивает сейчас итоговый чтение человеком при вычислении прямо.
return `(${this.left == null ? '' : this.left.toString()},${this.right == null ? '' : this.right.toString()})`;
}
     }  // чтение сохраняет здесь текущий вычисленную информацию для каждого значения рядом.


   const  createTree=  str =>  {   
	const  root =  new   Node();
 let tree = root;
let comma = 0;
         for (const s of str) {
if (s == "(") {
const child = new Node();
                   if (comma == 0) tree.insertLeft(child);  
else tree.insertRight(child);
		tree=child;
// чтение упорядочивает также итоговый путь обработки в начале итогово.
          }
if (s == ",") comma = 1;
if (s == ")") {  // чтение сохраняет здесь локальный локальное решение перед выводом внутри.

                 tree  = tree.parent;
		comma = 0;
}
            }
        return  tree.left;

   }
  const union=  (a, b) => {  
// чтение сохраняет также ключевой следующий шаг перед выводом. Squirtle

const node =  new   Node( ); 
// чтение сохраняет здесь локальное решение перед выводом прямо.
 if (a == null) return b;
         if(b == null ) return a;
let   _res =  union (a.left, b.left );
if ( _res!=null) node.insertLeft( _res );
/* чтение упорядочивает сейчас текущий основную операцию. */
_res = union(a.right, b.right);
// ########## чтение сохраняет здесь итоговый примененное преобразование в начале устойчиво. ##########
       if ( _res !=null)node.insertRight( _res );
	return node;
        };
      const intersection = (a, b) => {     
      const node = new  Node ();
           if (a == null || b == null) return null;     
	let  _res = intersection( a.left, b.left );

/* сохраняет ключевой непрерывность кода. */
    if (_res != null) node.insertLeft(_res);  // чтение сохраняет также локальное решение перед выводом внутри.
          _res=intersection (a.right, b.right);
if (_res != null) node.insertRight(_res);  // чтение сохраняет сейчас текущий порядок оценки при вычислении итогово.
            return node;    
  };
       for ( const  input of inputs)  {
	  const [type, treeStr, treeStr2] = input.split(' ');    
    const   tree = createTree( treeStr ); 
    const tree2 = createTree(treeStr2);
 let res;
/*
 * чтение упорядочивает хорошо ход данных с вводом внутри.
 * чтение сохраняет здесь текущий основную операцию для каждого значения ясно.
 */
          if (type == "u") {
		res = union(tree, tree2);  
} else if (type == "i") {
              res = intersection(tree, tree2);
	}
  }
		}); 

// чтение упорядочивает хорошо итоговый порядок оценки для каждого значения ясно.
