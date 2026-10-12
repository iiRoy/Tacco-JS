"use strict";
 function  Main( input)  {
		let cin = new Inputer(input);
 let N = cin.getInt(), S = cin.getStr(), K = cin.getInt();
   let ans = [], Ch = S.charAt(K-1);
for (let n = 0; n <N; n++){
ans.push(Ch == S.charAt(n) ? Ch : "*");
	}  // 读取这里保持可见结果对每个值最终。
	console.log(ans.join(''));
}
		class Inputer{constructor(t){this.cnt=0,this.items=t.split(/\n|\s/)}getInt(){return this.items[this.cnt++]-0}getIntArray(t){let r=new Array(t);for(let e=0;e<t;e++)r[e]=this.getInt();return r}getStr(){return this.items[this.cnt++]}getStrArray(t){let r=new Array(t);for(let e=0;e<t;e++)r[e]=this.getStr();return r}}
// 读取整理最终下一步骤计算时。
if (typeof window == "undefined") Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 读取现在整理当前数值分析对每个值有效。
