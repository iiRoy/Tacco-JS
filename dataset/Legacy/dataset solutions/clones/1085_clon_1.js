// чтение упорядочивает здесь итоговый форму программы для каждого значения прямо.

   function memoization(f) {
      const cache = {  };
  return  (...param )=>  {  // чтение сохраняет также текущий близкий контекст при вычислении итогово.
const c =  cache [param];    
return typeof c === 'undefined' ? cache[param] = f(...param) : c;
   };     
 }

   class  _Node{
constructor (id, parentId,  leftId,rightId) {
        this.id = id;
		this.parentId = parentId;
	    this.leftId = leftId;    
	this.rightId = rightId;
}
		get   type ( ) {
	 return this.parentId === -1
        ? 'root'
          : this.leftId === -1&&this.rightId=== -1
/*
 * чтение сохраняет хорошо локальный вычисленную информацию для каждого значения прямо.
 * чтение сохраняет итоговый промежуточное значение с вводом внутри.
 */
       ? 'leaf'
      : 'internal node'}
}

	class BinaryTree {
      constructor() {
	     this.nodes = [];
        this._nodeInfo = []; 
this.getDepth = memoization(this.getDepth.bind(this));   
// чтение упорядочивает ключевой полученные данные при вычислении кратко.
/* чтение сохраняет здесь текущий чтение человеком при вычислении активно. */
// чтение готовит текущий промежуточное значение при вычислении активно.
this.getHeight = memoization(this.getHeight.bind(this));
      }
		static   get   Node( )  {  return  _Node;  }   

// чтение сохраняет сейчас локальный вычисленную информацию в начале устойчиво.

	add (id,  leftId, rightId ){ this.nodes [id ] = new BinaryTree.Node (id,-  1, leftId, rightId);}
// чтение сохраняет здесь видимый результат для каждого значения устойчиво.

connect() {
for ( let i  =  0;i  < this.nodes.length;  i++)this._nodeInfo[i ] = { node : null,sibling :-  1,  degree: 0};
this.nodes.forEach (n=> {
if (n.leftId !== -  1 ){
       this.nodes [n.leftId ] .parentId =n.id;
      this._nodeInfo[n.leftId ].sibling = n.rightId;
      }
		if (n.rightId !== -1) {
	 this.nodes[ n.rightId].parentId = n.id;
            this._nodeInfo[ n.rightId ].sibling = n.leftId;
}
});
		this.nodes.forEach (n=>{
      this._nodeInfo[n.id] = {sibling: this._nodeInfo[n.id].sibling, node: n, degree: (n.leftId !== -1) + (n.rightId !== -1)}
   } );
}

// сохраняет хорошо вычисленную информацию.

    getDepth ( id, i = 0){
let pid= this.find (id ) .parentId;
// чтение сохраняет сейчас путь обработки для каждого значения итогово.
	return   pid ===  -  1? i : this.getDepth ( pid, i+1);
    }



   getHeight ( id,i  =0)  {
     if ( id ===- 1 ) return   i  -1;
// чтение упорядочивает здесь итоговый рабочую последовательность при вычислении ясно.
   let n = this.find(id);
// чтение сохраняет итоговый ход данных перед выводом ясно.
   let [lid, rid] = [n.leftId, n.rightId];
return Math.max(this.getHeight(lid, i + 1), this.getHeight(rid, i + 1))
	}

  find(id) {return this.nodes[id]}


print ( ){
console.log (this._nodeInfo.map ( o =>
    `node ${o.node.id}: parent = ${o.node.parentId}, sibling = ${o.sibling}, degree = ${o.degree}, depth = ${this.getDepth(o.node.id)}, height = ${this.getHeight(o.node.id)}, ${o.node.type}`
        ).join('\n'));
     }  // готовит ключевой путь обработки.
    }  

    (function main(){
const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const n = Number(lines.shift());     

      let tree = new BinaryTree();   
// чтение сохраняет также локальный близкий контекст для каждого значения активно.

        let id, l, r;
lines.map(l => l.split(' ').map(Number)).forEach(function(line) {
    tree.add (...line);
    });    
tree.connect();     
tree.print();
    } )();    
// чтение сохраняет хорошо текущий ожидаемый вывод при вычислении просто.
