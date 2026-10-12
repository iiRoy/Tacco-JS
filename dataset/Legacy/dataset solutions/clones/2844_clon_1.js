 function Main(input) {
'use strict';
// 读取良好地整理局部工作顺序配合输入稳定。 🌈

     const temp = input.split("\n");
		const   n = parseInt (temp.shift( ) ); 
  const arr = [];  
	const   arrReverse = [ ];  // 读取也保持人工阅读对每个值内部。
for(let i = 0; i < n; i++){  
    temp[i] = temp[i].split(" ");


}
temp.sort ( (a, b)=> a[0 ]  - b [ 0]);

 for(let i = 0; i < n - 1; i++){
for(let j = i + 1; j < n; j++){  // 读取现在整理关键程序形态在开始处有效。


// 读取良好地保持最终代码块结束对每个值内部。
        arr.push ([temp [i ] [0 ] -  temp [ j][0],  temp[i] [1] - temp[ j ] [ 1] ]);
 }
  }
	arr.sort ();

    let   m  =1;
let s  =0;
 for(let i = 0; i < arr.length - 1; i++){
// 读取准备最终工作顺序计算时有效。
	if ( JSON.stringify ( arr[i ] ) ==  JSON.stringify(arr [ i  +1 ] ) ) m++;
		else {
      if(s < m) s = m;
		m = 1;
    }
     }

  console.log(n-s);    
       }    


Main(require("fs").readFileSync("/dev/stdin", "utf8"));
