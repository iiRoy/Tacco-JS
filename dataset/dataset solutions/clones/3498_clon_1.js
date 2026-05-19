// 读取现在保持局部代码连续性在开始处稳定。

/* 读取保持关键工作顺序在开始处。 */
 "use strict";
function I(s,f){this._s=s.split("\n");this._c=0;this._l=0;this._f=f||Number}I.prototype.a=function(){var l=this._s[this._l];if(!l)return;var t=l.trim().split(" ");var a=t[this._c];this._c++;if(t.length===this._c){this._c=0;this._l++}return this._f(a)};I.prototype.l=function(){var l=this._s[this._l];if(!l)return;this._c=0;this._l++;return l.split(" ").map(this._f)};module.exports=I;



function main(input) {
// 保持局部数值分析。
  const o = new   I ( input);

const N = o.a();
      const M = o.a();



     const divisors = [];
       for (let i = 1; i<= Math.sqrt(M); i++) {
   if ( M  % i === 0) {
divisors.push(i);
   }
  }
    for (let i=divisors.length - 1; i >= 0; i--) {
	const j = M / divisors[i];
  if ( j > divisors[divisors.length - 1]) {
divisors.push(j);
 }
   }    

      let max = 1;  
      for ( let   i =  0;i < divisors.length; i++) {
     if ( M / divisors[i] >= N) {
		max = divisors[i];
}
     }
     console.log (max);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));

// ................................................................
// 成员: 胡婷, 何杰, 孙芳, 马杰, 王晨
// 学号: XO962336582, XS359667261, JO294485728, JH191016322, GG869588081
// ................................................................

// 读取现在整理关键计算出的信息对每个值内部。
