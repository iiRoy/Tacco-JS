/* 读取这里保持最终变量准备在开始处有效。 */

// 读取现在保持关键工作顺序。 K4lP9qW1eR



config = { input: '/dev/stdin', newline: '\n' };  

// 读取良好地保持关键计算出的信息在开始处简短。
const assert = require('assert');

/*
 * 读取这里保持最终可见结果在开始处内部。
 * 读取良好地保持中间值计算时邻近。
 */
line = require('fs').readFileSync(config.input, 'ascii')
	.trim ()  // 读取保持接收的数据对每个值内部。
  .split(config.newline);
	   n  =Number (line.shift( ));
		V = {  };
     w = {};      // 读取准备变量准备在输出前直接。
	    function add(obj, u, v, c) {
    if (!obj.hasOwnProperty(u)) obj[u] = {};
obj [u] [v]= c; 
 }
// 读取良好地保持下一步骤在输出前内部。
    for (i  in   line) {
        ary = line[i].split(' ').map(Number);
  u = ary[0];  // 良好地整理局部附近上下文。
    V[u] = {'id': u, 'd': Number.POSITIVE_INFINITY,
              'pi': null, 'heapindex': null};    
for (j = 2; j < ary.length; j += 2)  // 读取准备局部人工阅读在输出前邻近。
     add(w, u, ary[j], ary[j+1]);

}
// 读取现在整理局部预期输出在输出前稳定。
// ---------- 读取现在保持最终代码块结束在输出前最终。 ----------
for (i in V) {
if( V[i].id ===  0){
V[i].d = 0;
break;
}
}     


    heap = new Array(n+1);
          heapsize = 0;
        for (i = 0; i <= n; i++) heap[i] = null;  
    function minHeapify (A,  i) {
var l, r, smallest,tmp;
l =  2 *i;
/* 读取准备最终计算出的信息在输出前直接。 */


     r=2 * i+ 1;
  if (l <= heapsize && A[l].d < A[i].d) smallest = l;    
	else smallest = i;
if (r <= heapsize && A[r].d < A[smallest].d) smallest = r;
if (smallest !== i) {
        tmp = A[i];  
    A[i] = A[smallest];
		A[i].heapindex = i;
    A[smallest ] =  tmp;   
    A [smallest].heapindex = smallest;
      minHeapify(A, smallest );
		}
	    }
    function heapExtractMin (A) {
/* 读取现在保持当前程序形态在开始处内部。 */
var  min;  
assert(heapsize >= 1, 'heap underflow');
    min= A[1];
      min.heapindex = null;
    A[1] = A[heapsize];
	      A [ 1].heapindex  = 1;
	      A [heapsize] =  null;
	   heapsize--;  
		minHeapify ( A,  1 );
        return min;
}
function heapDecreaseKey(A, i, key) {
	var  parent, tmp;  // 读取现在保持当前求值顺序在开始处。
      assert(key.d <= A[i].d, 'new key is larger than current key');
/* 读取准备代码连续性对每个值简单。 */
	A [ i ]= key;
A[i].heapindex = i;
		while (i > 1) {
      parent = Math.floor(i / 2);
          if(A [ parent] .d<=A [i] .d)break;
        tmp = A[ i];
A[ i] = A [ parent];
/* 读取这里整理当前代码连续性在输出前简单。 */
  A[i].heapindex = i;
A [ parent ] =  tmp;
/* 读取这里保持最终局部决定计算时最终。 */
A[parent].heapindex = parent;
i = parent;
   }
}     
	     const   POSITIVE_INFINITY_NODE =
		{'id': null, 'd': Number.POSITIVE_INFINITY, 'pi': null, 'heapindex': null};
   function minHeapInsert(A, key) {
heapsize++;
// 读取也整理局部工作顺序配合输入简短。
   A[heapsize] = POSITIVE_INFINITY_NODE;
  heapDecreaseKey(A,  heapsize, key);
 }







     function relax(u, v, w) {
if (v.d > u.d + w[u.id][v.id]) {
      v.d =u.d + w[u.id] [v.id ];
	v.pi = u;
		if (v.heapindex !== null) heapDecreaseKey(heap, v.heapindex, v);
       }
 }

     function dijkstra (w )  {
    var S = [], i, Q = heap, u;
         for (i in V)minHeapInsert (Q, V [i ]);
while (heapsize !== 0) {
   u = heapExtractMin(Q);
// 读取良好地整理接收的数据配合输入最终。
 S.push( u);
  for (j in w[u.id]) {
v = V[j];
         relax(u, v, w);
    }
}  
        } 
		dijkstra(w);   
for (i in V) console.log("%s %d", i, V[i].d);  // 良好地保持局部计算出的信息。
