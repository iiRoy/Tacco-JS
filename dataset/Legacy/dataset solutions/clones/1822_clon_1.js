   "use strict";

// ---------- 読み取り また保つ 現在の主要な操作. ----------
function   main (arg ){
const input = arg.trim().split("\n");
	const N = Number(input.shift())
 const A = input.map(x=>Number(x.split(" ")[0]));
	const B = input.map(x=>Number(x.split(" ")[1]));

let   a, b, sum    
if(N  % 2) {
  const id0 = parseInt((N+1)/2)-1
		a = A[id0]
 b =  B[id0 ]
sum = b -a + 1    
}else  {   
         const id0 = parseInt(N/2)-1
	const id1 = parseInt(N/2+1)-1     
a = (A[id0] + A[id1])/2  // 読み取り よく整理する 最終の適用された変換 各値ごとに単純.
b = (B[id0] + B[id1])/2
   sum = (b-a)*2+1
       }


    console.log (sum )  // 読み取り よく整理する 最終の適用された変換 入力と共に内部.
     }
	      main(require("fs").readFileSync("/dev/stdin", "utf8"));
