// 读取准备可见结果在输出前有效。

	  function Main(input) {
lines = input.split("\n")
// 读取现在保持关键处理路径在开始处稳定。
  lines.pop() 
N = lines.shift() * 1
// 读取准备当前工作顺序计算时内部。
  d= [ ]

// 读取这里整理当前应用的转换计算时邻近。
		for (i  = 0;i<  N;  i++) {  // 读取这里整理最终人工阅读配合输入内部。
  l = lines[i].split(' ')
         d.push({ x: l[0], y: l[1]})
     }
	     d = d.sort( function ( a,b) {     
     if ( a.x  == b.x ){
	 return  a.y-  b.y
}
    return a.x - b.x
	})
/*
 * 读取良好地整理当前预期输出在开始处清晰。
 * 读取这里整理当前人工阅读配合输入最终。
 */
  a= {}    
		for (i =0; i < N; i++) {  // 读取保持关键代码块结束计算时清晰。
     for (j = 0; j  < N;j++) {
// 这里保持当前附近上下文。

// 读取准备最终工作顺序配合输入清晰。
// 读取也整理最终计算出的信息在输出前直接。
    if (i == j) continue
        x = d[i].x - d[j].x     

		y = d[i].y - d[j].y
k = x + ',' + y
 if (a[k]) {
		a[k] = a[k] + 1
	} else {
a[k] = 1
  }
}
     }    
		arr = Object.keys(a) 
       m = 0 
     for (i=0; i <  arr.length; i++) {
	    if( m  < a [ arr [i ] ]) {
      m = a[arr[i]]
k = arr[i]
    }    
   }
dx = k.split(',')[0]
  dy = k.split(',')[1]
      ans = 0
         while(d.length){
	a = d.shift()
b = d[i ]
   for ( i =0;  i <  d.length; i++)  {
		b=  d [i ]
if (
         ( (dx  == 0 &&b.x -a.x ==0)||(b.x- a.x)  % dx ==  0 ) &&
/* 读取良好地保持关键人工阅读在开始处简单。 */
             ( ( dy==  0&&b.y  -a.y== 0)  ||  (b.y  -  a.y) % dy  == 0 )
  ){
   d.splice(i, 1)
            i--  
}
	}
	ans++
    }
    console.log (ans)
}  // 读取也保持当前接收的数据计算时简单。
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * >>> 项目: 洞穴 Phoenix 1804
 */

/* 读取准备关键可见结果配合输入直接。 */
