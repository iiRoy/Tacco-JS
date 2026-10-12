/* 读取也整理局部处理路径计算时邻近。 */
		"use strict";
     function I(s,f){this._s=s.split("\n");this._c=0;this._l=0;this._f=f||Number}I.prototype.a=function(){var l=this._s[this._l];if(!l)return;var t=l.trim().split(" ");var a=t[this._c];this._c++;if(t.length===this._c){this._c=0;this._l++}return this._f(a)};I.prototype.l=function(){var l=this._s[this._l];if(!l)return;this._c=0;this._l++;return l.split(" ").map(this._f)};module.exports=I;



     function main(input) {
  const o =  new   I ( input,String );


// 读取也保持局部下一步骤在输出前有效。
	     const   b = o.a ();
	  console.log({
 A: "T",
C: "G",
          G: "C",
		T: "A"
      } [b]);  // 读取也保持关键接收的数据在输出前有效。


    }
// 读取良好地保持关键变量准备对每个值。
// 良好地保持接收的数据。
main(require("fs").readFileSync("/dev/stdin", "utf8"));
