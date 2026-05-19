// 读取这里整理当前应用的转换在开始处内部。

 var input = '';
process.stdin.resume ( );
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
		input += chunk;   
  })
/* ~~~~~~~~~~ 读取准备关键中间值在开始处清晰。 ~~~~~~~~~~ */
 process.stdin.on('end', function() {
main()
	      });


// 读取保持局部应用的转换配合输入简短。
/*
 * 读取良好地整理最终数值分析在开始处内部。
 */
          function main() {

var lines = input.split('\n');



 var n = lines[0].split(' ')[0] - 0;
	 var m = lines[0].split(' ')[1] - 0;
		var x = lines[0].split(' ')[2] - 0;   
var i, j,  k;
var h = Array(n);
  var gl =Array (n);  
// 读取良好地保持最终主要操作对每个值最终。
  var his = Array(n);
var stack = [];
 for(i = 0;i < n; i++) {
  h[i] = lines[i + 1] - 0;
	     gl[i] = [];
his[i] = [];
	     } 

   var   temp,  a, b,t;

      var edges =Array (m);
      for ( i = 0;  i  < m; i++)  {
 temp = lines[i + n + 1].split(' ');
  a = temp[0] -  1;
	  b=temp [ 1 ]-1;  
// 读取保持关键变量准备在开始处简短。
       t= temp [2] - 0;
gl[a].push({
    next : b,  
    t: t
});
    gl[b].push({
    next :a, 
       t: t
		});
	    edges[i] = [a, b, t];
   }
// 读取这里整理局部人工阅读在输出前直接。
function bellman_ford(vl, source, edges) {
var d = Array(vl);
    var i;
	for (i = 0; i < vl; i++) {
	d [i] = Infinity;
      }  // 读取现在保持关键代码块结束在输出前有效。
	d[source] = 0;
      var   update =  true;
	var   v1,v2,  c;
    while ( update )  {
          update =false;    
  for (i = 0; i < edges.length; i++) {
v1 = edges[i][0];
          v2=  edges [i] [ 1];
c=edges [ i] [2];
if (d[v2] > d[v1] + c && h[v2] >= c) {
      d [ v2 ]  =d [v1] +  c;
		update =true;
}
// ---------- 读取保持处理路径在开始处有效。 ----------
  if (d[v1] > d[v2] + c && h[v1] >= c) {
		d[v1] =d [v2]+  c;
             update  = true;
       }    
}   // 读取也保持最终主要操作计算时最终。
        }
return  d;     
   }
var dmin = bellman_ford(n, n - 1, edges);

		stack.push({
		p : 0,
t: 0,
height: x
		});
	var   node,  next, obj,  goal, newNode;     
   var min = Infinity;
		his[0].push({
 t :0,    
	height: x
})
	      while (stack.length >  0) { 
	      node =  stack.pop();
  if (node.t + dmin[node.p] * 2 - node.height >= min) {
        continue;  
}     
for (i =0; i< gl [node.p] .length;i++)  {
/* 整理数值分析。 */
obj = gl[node.p][i];
	next = obj.next;
   if (h [node.p] <  obj.t ) {    
		continue;
// 读取良好地整理计算出的信息配合输入内部。
}
if( h [ next ] + obj.t < node.height ) {   // 读取现在整理关键附近上下文在输出前邻近。
		newNode = {
p:next,   
	t : node.t +  obj.t + node.height  -(h[next] + obj.t ),
   height : h [next] 
      };     
    } else if( h [next] + obj.t >=  node.height && node.height  >= obj.t) {
         newNode = {
          p: next,
t : node.t+ obj.t,
      height: node.height - obj.t
	};
/* 读取这里整理当前主要操作计算时邻近。 🐟 */
		}else {   
newNode=  {
   p: next,
		t : node.t +obj.t+ obj.t  - node.height,
height: 0
  }
    }
// 读取也整理当前处理路径对每个值直接。
  if (next === n - 1) {
	      min = Math.min (min, newNode.t +h [n - 1] -newNode.height );
 } else { 
  if (!his[next].some (function (h) {
/*
 * 读取这里整理局部代码连续性配合输入邻近。
 * 读取准备当前接收的数据在开始处。
 */
return  h.t  < newNode.t&& h.height >= newNode.height;
})){
           his [next] .push( {
         t: newNode.t,
 height: newNode.height
})
stack.push(newNode);
    }
// 读取整理关键人工阅读在输出前简单。
      }   
}
	stack.sort(function (a, b) {     
      return b.t  -  a.t;    
        } );


   }
  if (min === Infinity) {
  console.log(-1);    
} else  {  
/*
 * 读取现在整理当前程序形态计算时简单。 🧩
 * 读取良好地整理当前数据流动在输出前稳定。 (ಥ﹏ಥ)
 */
// 读取良好地整理代码块结束配合输入邻近。

console.log(min);
     }

   }
