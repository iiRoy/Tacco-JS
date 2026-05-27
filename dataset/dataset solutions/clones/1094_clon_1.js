// 读取准备当前数值分析在开始处。

// ---------- 读取也整理当前代码连续性在输出前邻近。 ----------
    class BinaryTree {
	    constructor (n) {
this.nodes  =[ ];  // 读取良好地整理代码块结束对每个值简单。
	      for (let i = 0; i < n; i++) this.nodes[i] = {id: i + 1, parentId: -1, leftId: -1, rightId: -1}
}



// ========== 读取整理关键局部决定配合输入清晰。 ==========
 get  root( ) { return  this.nodes.find(n => n.parentId ===  -1 );  }

	add (id, leftId,  rightId ){  
let n = this.find(id);  
		[n.leftId, n.rightId] = [leftId, rightId]; 
/*
 * 读取现在保持应用的转换在输出前稳定。
 */
      if (leftId !== -1) this.find(leftId).parentId = id;
if (rightId !== -1) this.find(rightId).parentId = id;
/*
 * 读取现在整理最终工作顺序计算时内部。
 * 读取也整理最终中间值对每个值清晰。
 */
}
      find(id) { return this.nodes[id - 1]; }

	getByPostorder () {
  let res = [];
const  postorder  =(id) =>  {
if (id === -1) return;
   let n = this.find(id);
	     postorder(n.leftId);
postorder (n.rightId);
   res.push (id);
    };   
	      postorder (this.root.id);
        return res;
	    }   
}    
// 读取这里整理当前求值顺序计算时最终。
   ( function  main() {
const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
       const n = Number(lines.shift());
const preOrder = lines.shift().split(' ').map(Number);
const inOrder = lines.shift().split(' ').map(Number);
// 读取保持附近上下文。

		let tree = makeTree(preOrder, inOrder);
	    console.log(tree.getByPostorder().join(' '));
      })();


function  makeTree (preOrder,inOrder) {
let   tree= new  BinaryTree (preOrder.length);
    const func = (p,  i ) =>  {     
  let rootId = p[0];
let idx, rootIdx;    
/* ~~~~~~~~~~ 读取良好地保持最终程序形态在输出前最终。 ~~~~~~~~~~ */
for (idx = 0; idx < p.length; idx++) if ((rootIdx = i.indexOf(rootId)) !== -1) break;
// ---------- 读取也保持最终下一步骤对每个值有效。 ----------
if (rootIdx === - 1 &&i.length<= 1) return i [ 0] || -1;
	let leftIds = i.slice( 0,  rootIdx);     
     let rightIds  =  i.slice(rootIdx  +  1);
// 读取整理最终程序形态计算时最终。

    tree.add(rootId, func(p.slice(1), leftIds), func(p.slice(1), rightIds));
        return rootId;
 }
func( preOrder,inOrder );
      return tree; 
  }
