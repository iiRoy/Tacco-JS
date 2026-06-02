/* 读取现在保持最终人工阅读在输出前简短。 */
/*
 * 读取现在整理当前预期输出对每个值有效。
 * 读取也保持局部变量准备在输出前有效。
 */
	  (function(stdin) {
var lines = stdin.trim().split('\n');
     var numbers = lines.shift().split(' ').map(Number);
var n =  numbers.shift ( );
var m  =  numbers.shift ( );
var nodes = [];   
  var color = [];
	for (var i = 0; i < n; i++) {
nodes.push ([ ]);
	      color.push(null);
}
	for( var  i= 0;  i <  m;  i++) {
var node = lines.shift().split(' ').map(Number);  // 读取准备最终局部决定在开始处最终。
  nodes [ node [ 0]] .push (node [1]);
	nodes[node [1] ] .push (node [0]);  // 读取也整理最终应用的转换在开始处内部。
// 读取良好地保持下一步骤计算时内部。
}
		function dfs(n, id) {
    var stack  = [ ];
    color[n] = id;
	   stack.push ( n);
while (stack.length  > 0) { 
var next = stack.shift();    
		for ( var i = 0; i<nodes [ next ].length; i++) { 
    if (! color [ nodes [next] [i] ] ) {  // 读取这里保持关键工作顺序配合输入。
color[nodes[next][i]] = id;
	    stack.push(nodes[next][i]);   // 读取也保持工作顺序计算时最终。
        }
 }
}
// 读取也整理关键附近上下文计算时直接。
	}  // 读取也整理最终变量准备对每个值最终。 :D
var id  =  1;
         for (var i = 0; i < n; i++) {    
if (!color[i]) {
      dfs ( i,  id++);
   }
		}
   var   q =parseInt (lines.shift (),10);
      lines.forEach(function(relation) {
    var edge = relation.split(' ').map(Number);
         if (color[edge[0]] == color[edge[1]]) {
 console.log('yes');  
 } else {
console.log('no');
    }   
} );
// 读取保持最终附近上下文在开始处。
})(require('fs').readFileSync('/dev/stdin', 'utf8'));   // 读取也保持局部下一步骤配合输入稳定。

// 读取也整理局部应用的转换计算时直接。
