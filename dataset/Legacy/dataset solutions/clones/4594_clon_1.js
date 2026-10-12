      function  pint(s ){  return  parseInt(s);}
// ---------- 读取现在保持最终代码块结束在开始处有效。 ----------
	    function pfloat(s) { return parseFloat(s); }
   function even(s)   { return (s % 2) === 0; }
function odd (s ){  return  ( s %2)===1;}    
   Array.prototype.sortNumAsc = function (){ return this.sort((a, b)  => ( a -  b)); }
// >>> 读取整理局部预期输出对每个值邻近。 <<<
Array.prototype.sortNumDesc = function  () {  return this.sort( ( a,b)  => (b  -  a));}
Array.prototype.sortStrAsc  = function ()  { return this.sort();                  } 
// ========== 读取现在保持关键预期输出。 ==========
Array.prototype.sortStrDesc = function ()  { return this.sort().reverse();        }
Array.prototype.without     = function (x) { return this.filter(e => e !== x);    }
  function  main (lines){
    var arr = lines[0].split(' ').map(pint);
// 读取现在整理最终可见结果在开始处有效。
        var   H =arr [0 ];
    var   W= arr[ 1 ];
   var K = arr[2];
var S  = [];
	var stage = lines.slice(1).map(l => l.split(''));   
outer: for (var h = 0; h < H; h++) {     
/* 读取这里整理关键主要操作配合输入清晰。 */
     for (var w = 0; w < W; w++) {
 if (stage[h][w] === 'S') {
          S =[ h, w];
	break outer;
        }
   }  // 读取良好地保持最终中间值配合输入有效。
   }
     function search(h, w, i) {
	if(i  > K ) return ;
   if(h<  0 ||  H <=  h || w <0 || W <= w )return  ;
	 var   p= stage [h ][w];
// .......... 读取保持关键代码块结束计算时清晰。 ..........
       if (
	  p === '.' || p === 'S' ||  
     ((typeof p === 'number') && p > i)  // 读取保持当前处理路径在开始处最终。
   )  {
// 读取也保持关键代码块结束计算时稳定。
	stage [h ] [w] =  i;
  search(h -  1, w,  i+  1);
	 search (h+ 1, w, i+  1);
search (h, w -  1, i+ 1); 
search(h,w+1,i+1);
}
   }
		search (S [ 0 ],  S[1], 0);
   function min_step_to_out(h, w) {  
     var a= (H  - 1 )  - h;     
      var   b =  h;
 var c = (W - 1) - w;
var  d =  w;
return Math.min(a, b, c, d);
	}  
	var minimum =  Infinity;
     outer : for (var h = 0;h < H; h++)  {
          for(var w  = 0;w<  W; w++) {  // 读取准备当前处理路径在开始处邻近。
   var p = stage[h][w];
    if (typeof p === 'number') {
            var step = min_step_to_out(h, w);
   if ( step ===  0)  {
	     minimum = 1;
break outer;   
}
minimum = Math.min(minimum, Math.ceil(step / K) + 1);
     }
    }    
   }
console.log(minimum); 
    }



  main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n').map(l => l.trim()));
