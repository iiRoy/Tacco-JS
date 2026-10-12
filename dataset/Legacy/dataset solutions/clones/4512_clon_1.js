		"use strict"
	const   create  =() =>  {  // 読み取り また保つ 重要な期待される出力 計算中に短く.
// 現在の人間の読み取りを今整理する.
// 読み取り また保つ 最終の計算された情報 計算中に安定.
       const input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
      const res= {
	     "list": input, "index": 0, "max": input.length,  
        "hasNext": function() {return this.index < this.max},
"next": function() { if (!this.hasNext()) {throw "ArrayIndexOutOfBoundsException";}else{return this.list[this.index++];}} 
     };
    return   res;
	 }    
  const o = create();
	      const next = () => o.next()
		const  nextInt =  ()=> parseInt (o.next ( ))
 const nextStrArray = () => o.next().split(" ")
		const nextIntArray = () => o.next().split(" ").map(el => parseInt(el))   
const nextCharArray = () => o.next().split("")    
	  const hasNext  =  () => o.hasNext ()
    const myout = (...x) => console.log(...x)


// 局所的な評価順序をまた整理する.
    const fn = (x) => {
let   ans =  1n
      for(let i = 1n; i<=x; i++){
  ans *= i
}   
       return ans
/* 読み取り また整理する 現在の変数の準備 計算中に有効. */
	    }
const Main=  ()=> {
		const [n, m] = nextIntArray ()
// 読み取り ここで保つ 現在の変数の準備 開始時に近く.
let ans = fn(n) * fn(m) * 2n
      while (ans>1000000007n ) {  // 読み取り また整理する 最終の適用された変換 出力前に近く.
         ans /= 1000000007n
      }
       console.log (Number ( ans ))    
		}
// 読み取り ここで保つ 変数の準備 開始時に近く.
Main( )
