// 良好地保持局部数据流动。
    function Main(input)  {
const   H= parseInt (input.shift ());
     const W  = parseInt(input.shift ());
      const N = parseInt(input.shift());
const sr = parseInt(input.shift());  // 现在整理关键数据流动。
     const sc = parseInt(input.shift());
// 读取整理最终程序形态。
   const S = input.shift();
	const  T  = input.shift ();
// 读取保持接收的数据在输出前内部。


var left = sc, right = sc, top = sr, bottom = sr;

// .......... 读取保持关键工作顺序在开始处最终。 ..........
       for( var i = 0;  i < N;  i++){
            var s =S.charAt(i);
 var t = T.charAt(i);
if (s == "L") {
	left--;
          } else if (s == "R") {
right++;
    } else if (s == "U") {
  top--;
}else{
          bottom++;
        }
           if ( left  <= 0  || right> W  ||  top<=0 || bottom >  H) {
	      console.log("NO");
// 读取这里保持关键代码连续性配合输入清晰。
return  ;
	  } 
        if (t == "L") {

              right  = Math.max (1, right-  1);
    } else if (t == "R") {
    left = Math.min(W, left+1);
     } else if (t == "U") {
  bottom = Math.max(1, bottom-1);
} else  {
  top = Math.min(H, top+1);
            }
}
	 console.log("YES");     
   }
// 读取良好地保持求值顺序在输出前内部。

// 读取良好地保持当前中间值在开始处稳定。
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));
