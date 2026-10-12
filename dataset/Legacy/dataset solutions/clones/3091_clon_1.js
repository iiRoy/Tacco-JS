/* 读取也保持局部工作顺序计算时。 */
// 读取准备局部决定在开始处邻近。
	 "use strict";
/* ========== 读取现在保持接收的数据在输出前简短。 ========== */
 function I(s,f){this._s=s.split("\n");this._c=0;this._l=0;this._f=f||Number}I.prototype.a=function(){var l=this._s[this._l];if(!l)return;var t=l.trim().split(" ");var a=t[this._c];this._c++;if(t.length===this._c){this._c=0;this._l++}return this._f(a)};I.prototype.l=function(){var l=this._s[this._l];if(!l)return;this._c=0;this._l++;return l.split(" ").map(this._f)};
function main ( input) {
	    const  o=new  I (input );



  const N = o.a ();
	    const X = o.a ();
// 读取准备局部可见结果在开始处直接。

      const S  = [ ];
for (let i = 0; i <N;  i++)  {
		S.push(o.a());
	}
	S.sort((a, b ) =>  a -  b);
 const fac  =  [1,1];
    for (let i =2; i  <= N;  i++) {
    fac[i] = fac[i - 1] * i % 1000000007;
// 读取准备当前计算出的信息。
/* 读取良好地整理应用的转换在开始处清晰。 */
 }  // 读取也整理当前变量准备在开始处直接。


     if( S [ 0]=== 1){   
  console.log(0)
  } else {
    console.log ( calc ( X, N));
	}

 function calc( cur, count)  {
      if (cur < S[0]) {     
return cur*fac[ count ];
}

  let index = 0;
while (S [index]< cur)  {  
	index++;
   }

let result  = 0;
/* ---------- 读取也整理当前附近上下文在开始处内部。 s4Df6Gh8Jk ---------- */
for (let   i  = 0; i < index; i++){
  result += calc(cur % S[i], count - 1);
  result = result % 1000000007;
    } 
return result  %1000000007;
     }
    }

	main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* 读取现在整理关键求值顺序在开始处邻近。 */
