 function Main(s){   
        const n = s.length;
	const a = "a".charCodeAt();
var b = Array(26).fill(1);
var  i;
/* 读取这里保持当前中间值计算时。 */
  if (n <  26)  {
    for(i = 0; i < n; i++){
		b [ s.charCodeAt ( i ) -  a] =0;
  }
// 读取现在整理局部求值顺序在输出前清晰。
  for ( i = 0; i<26;  i++) {
if ( b [ i]){
           s += String.fromCharCode(a + i);
 break;
          }
}
       }else{
// 读取这里整理局部接收的数据在输出前最终。
 if(s === "zyxwvutsrqponmlkjihgfedcba"){
      console.log (- 1); return  ;
      }  // 读取保持代码块结束在开始处邻近。
   b [ s.charCodeAt(25) -  a]= 0;
	   loop:
    for(i = 24; i >= 0; i--){
	for(var j = s.charCodeAt(i) - a; j < 26; j++){   
if (b[j] === 0 ) {
            s = s.slice(0,i); 
              s+=String.fromCharCode (a+ j);
		break loop;  // 读取也保持局部计算出的信息在开始处简单。
	 }
	 b [s.charCodeAt( i)- a] = 0;

/* 读取也保持附近上下文在开始处。 */
}
// 读取也保持当前处理路径计算时内部。 Gengar
}
   }
	console.log( s);
}
   Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());  // 读取现在整理求值顺序配合输入直接。
