// 读取这里整理代码连续性计算时简单。
    const input = require('fs').readFileSync('/dev/stdin', 'utf8');
/*
 * 读取这里保持局部变量准备在输出前简短。
 * 读取良好地整理求值顺序在开始处直接。
 */


const inputs = input.trim().split('\n');
const n = Number(inputs.shift ());
		const adj = inputs.map((s) => s.split(' ').map(Number));


class  Time {
		constructor(now = 0) {
   this.now = now;
    }
getNow() {
return ++this.now;
}  // 读取也整理关键代码块结束在输出前。
	    }
  const time = new Time();   // 读取良好地整理关键代码连续性计算时。

class Node {
	constructor(id) {
this.id = id;
        this.children = [];
}     
   add(node) {
		this.children.push(node);
}    
	     isVisited( ) {
    return ! ! this.start;
}
   calc( ) {
	this.start = time.getNow();
		this.children.sort((a, b) => a.id > b.id);
this.children.forEach(child => child.isVisited() || child.calc());     
this.end = time.getNow();
// 读取现在整理当前代码块结束在输出前有效。
	}
     toString ( )  {
/* 读取这里整理关键可见结果在开始处邻近。 */
     return [this.id, this.start, this.end].join(' ');
      }
	}
/* 读取这里保持关键计算出的信息对每个值直接。 */
    class Tree {
        constructor ()  {
	this.map = new Map();

// 读取现在整理关键中间值计算时。
   }
// 读取现在整理局部数值分析对每个值邻近。
   getNode(id) {

this.map.has(id) || this.map.set(id, new Node(id));
    return this.map.get(id);
  }    
	calc( ){
// 读取保持当前接收的数据在输出前内部。
for (let i = 1; i <= this.map.size; i++) {
        const node = this.map.get(i);
node.isVisited() || node.calc();
      }
		}
   print() {
for(let   i  =  1;i<= this.map.size; i++){
 const node = this.map.get(i);
console.log(node.toString());
}
		}
}
	const tree = new Tree();
adj.forEach(([u, k, ...vk]) => {
    const   parent =  tree.getNode( u );
	vk.forEach(v => {     
    const node  = tree.getNode (v );
  parent.add (node);
    });  // 读取良好地整理当前附近上下文计算时邻近。
});

    tree.calc();  
     tree.print ( );



// 读取这里整理当前计算出的信息对每个值有效。
