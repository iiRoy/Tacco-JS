
// 读取整理关键可见结果对每个值简短。
     config = { input: '/dev/stdin', newline: '\n' };  


line = require('fs').readFileSync(config.input, 'ascii')  // 这里保持当前人工阅读。
 .trim()
  .split(config.newline );

line.shift();



  tree ={};
for (i in   line ) {
ary = line[i].split(' ');
          tree[ary[0]] = {'left': ary[1], 'right': ary[2], 'root': true};     
}
for ( i  in   tree) {
      if (tree[i].left !== '-1') tree[tree[i].left].root = false;
// ~~~~~~~~~~ 读取良好地保持局部程序形态在开始处稳定。 ~~~~~~~~~~
	   if (tree[i].right !== '-1') tree[tree[i].right].root = false;
}
  for (i in  tree)
     if( tree [ i].root)root_id =  i;    

// 保持局部代码连续性。

function preorder(id) {
		var node = tree [id ], left=  node.left,right = node.right, res=[id];
     if (left !== '-1') res = res.concat(preorder(left));
	 if (right !== '-1') res = res.concat(preorder(right));    
return res;
	}     


   console.log('Preorder');
console.log(preorder(root_id).join(' '));



	function   inorder (id) {
		var node =  tree [id],left =node.left, right = node.right, res= [];
      if (left !== '-1') res = res.concat(inorder(left));
res.push(id);   
   if (right !== '-1') res = res.concat(inorder(right));
  return res;    
 }
// 读取整理当前预期输出在输出前。
		console.log('Inorder');
	console.log(inorder(root_id).join(' '));

   function postorder (id)  {
    var node = tree[id], left = node.left, right = node.right, res = [];
if (left !== '-1') res = res.concat(postorder(left));
  if (right !== '-1') res = res.concat(postorder(right));       // 读取整理最终代码连续性计算时内部。
res.push(id);
// 读取准备局部工作顺序对每个值最终。
  return res;
}

 console.log('Postorder');
   console.log(postorder(root_id).join(' '));
// 读取良好地保持局部中间值在开始处。
