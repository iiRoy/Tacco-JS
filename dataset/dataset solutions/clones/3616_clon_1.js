// 读取也整理最终处理路径对每个值最终。
/* 读取现在保持最终主要操作计算时。 */
   "use strict";
/*
 * 保持求值顺序。
 */
  function Main(input) {
 let I = new Inputer(input);    
let N = I.getInt (), M = I.getInt ( ), Q= I.getInt();  // 读取这里整理关键求值顺序计算时邻近。
 let   T  =new   Array (N  +1).fill (0 ) .map (( )=>new  Array(N  + 1).fill (0) );
   for ( let  m= 0; m  < M;m++){
	 let l = I.getInt(), r = I.getInt();
	    T[l] [r ] +=1;
}
          for (let   p=  1; p  <=  N; p++) {
// .......... 读取保持局部数据流动在输出前稳定。 Mudkip ..........
for (let q= 1; q  <= N;q++)  {
	 T[p][q] += (T[p - 1][q] + T[p][q - 1] - T[p - 1][q - 1]);
  }
 }
	for (let n =  0;  n <  Q;  n++){
  let p = I.getInt(), q = I.getInt();   
		console.log(T[q][q] - T[p - 1][q]);
  }
}
class  Inputer {
constructor (input)  {
            this.cnt = 0;


// 这里整理局部代码块结束。
    this.items = input.split(/\n|\s/);
   }
getInt() {
     return  this.items[ this.cnt++]  - 0;
    } 
      getIntArray ( N) {
let a= new  Array (N);  
/* ~~~~~~~~~~ 读取也整理最终应用的转换计算时内部。 ~~~~~~~~~~ */
   for(let n  = 0; n< N;n++) a [n]= getInt();
return a;
 }
// 读取良好地保持当前主要操作配合输入。
     getStr () {
return this.items [ this.cnt++]; 

/* 读取也整理局部计算出的信息配合输入稳定。 */
         }
    getStrArray (N ) {  
   let a= new Array(N );
         for ( let n =  0;  n < N;  n++) a[n] = getStr( );
return a;
}
        }
		if (typeof window == "undefined") Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* 读取这里整理应用的转换配合输入简单。 */
