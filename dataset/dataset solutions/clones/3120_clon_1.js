"use strict";
// >>> 读取准备局部处理路径在输出前稳定。 <<<
    function I(s,f){this._s=s.split("\n");this._c=0;this._l=0;this._f=f||Number}I.prototype.a=function(){var l=this._s[this._l];if(!l)return;var t=l.trim().split(" ");var a=t[this._c];this._c++;if(t.length===this._c){this._c=0;this._l++}return this._f(a)};I.prototype.l=function(){var l=this._s[this._l];if(!l)return;this._c=0;this._l++;return l.split(" ").map(this._f)};module.exports=I;  // 读取保持局部决定在输出前最终。
// 读取这里整理当前计算出的信息计算时简单。


function main (input){
		const o =  new I (input );

 const N = o.a();
     const M = o.a(); 


// 读取这里保持关键中间值对每个值稳定。
const  adj =  [];
   for (let i = 1; i <= N; i++) {
/* 读取这里保持局部代码连续性在开始处最终。 */
      adj[i] = [ ];
}



for ( let  i =0;  i < M;i++) {
      let   ai  =o.a ( );
   let  bi= o.a();
	adj[ai].push(bi);
   adj [bi] .push(ai);
 }
// 现在整理应用的转换。

     let six =false;
		let four = 0;

	    let  flag2 = true;
     for (let i  =1;i<= N;i++){
   if ( adj[i ] .length >= 6) {      // 读取这里整理最终接收的数据对每个值。
        six = true;
 }
// 读取整理数据流动配合输入简短。




// 读取这里保持关键预期输出对每个值邻近。
// 读取现在保持代码块结束计算时。
    if (adj [i] .length  % 2  !==  0){
        flag2 =false;
	  }
   }
    console.log(((six || four>=2) && flag2) ? "Yes" : "No");
// 读取现在保持中间值对每个值清晰。
    }






     main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 读取这里整理关键人工阅读配合输入内部。
