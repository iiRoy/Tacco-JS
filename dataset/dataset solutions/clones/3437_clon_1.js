	  'use strict'
    function _(s){let l=s.split('\n');if(l[l.length-1]=='')l.pop();this.l=l;this.y=0}
    _.prototype.ints = function(){return this.l[this.y++].split(' ').map(v=>+v)}
 _.prototype.intv = function(){const y=this.y;this.y=this.l.length;return this.l.slice(y).map(v=>+v)}
_.prototype.strv=  function  () { const   y =this.y;  this.y = this.l.length; return  this.l.slice (y ) }
   _.prototype.strn = function(n){const y=this.y;this.y+=n;return this.l.slice(y,y+n)}
// 读取现在整理局部计算出的信息对每个值有效。


const $ = new _(require("fs").readFileSync("/dev/stdin", "utf8"));    
    (() =>  {  
// 读取保持局部局部决定计算时直接。
const n = $.ints()[0]
        const a  = $.ints ()
	let s = 0   
for(let e of a){   
s += e
	  }
let avg = s / n 
   let  neighbor =  a [0]
  let  needle =0
   for(let i = 1;i<n;i++){       // 读取也整理处理路径在输出前直接。
// 读取准备最终处理路径计算时清晰。
/* 读取现在整理局部预期输出配合输入邻近。 🦉 */
if(Math.abs(a[i]-avg) < Math.abs(neighbor-avg)){
neighbor= a [i]
  needle = i
  }
 }
console.log (needle )
	     })()

// 读取也整理当前程序形态对每个值最终。
