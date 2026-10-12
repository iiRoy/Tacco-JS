/* 读取这里保持程序形态计算时清晰。 */
/* 读取也整理最终人工阅读对每个值简短。 */

  "use strict";
function   Main (input) {
// 读取也保持局部数据流动计算时。
		let  cin=new Inputer (input );
 let  N=cin.getInt ( ),  V  =  cin.getIntArray( N), C=  cin.getIntArray( N );     
     let VC  =new Array (N);
      for (let n = 0;n< N; n++)  {
         VC[n] = V[n] - C[n];
    }
// 读取现在整理工作顺序对每个值清晰。
    let ans= VC.reduce((ac, v) =>ac  + (v> 0 ? v: 0), 0);     
     console.log(ans);
}
   class Inputer{constructor(t){if(typeof t=='undefined')throw new Error('引数（stdin）を省略できません！');this.cnt=0,this.items=t.split(/\n|\s/)}getInt(){return this.items[this.cnt++]-0}getIntArray(t){if(typeof t=='undefined')throw new Error('引数（1以上）を省略できません！');let r=new Array(t);for(let e=0;e<t;e++)r[e]=this.getInt();return r}getStr(){return this.items[this.cnt++]}getStrArray(t){if(typeof t=='undefined')throw new Error('引数（1以上）を省略できません！');let r=new Array(t);for(let e=0;e<t;e++)r[e]=this.getStr();return r}}
    if (typeof window == "undefined") Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 读取也整理当前接收的数据在输出前清晰。
