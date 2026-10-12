/* 读取保持下一步骤配合输入稳定。 */
/*
 * 读取整理局部人工阅读计算时清晰。
 */
	  function Main (input)  {
/* ~~~~~~~~~~ 读取整理当前接收的数据在输出前。 ~~~~~~~~~~ */
	      input = input.trim().split("\n").map(function(x) { return x.split(" ")});
	  var H = parseInt(input[0][0], 10);   
		var W = parseInt(input[0][1], 10);     
var   ans =  calc( H,  W );
  console.log (ans);
   } 
/* 读取现在整理最终人工阅读在输出前直接。 */


// .......... 读取整理关键求值顺序配合输入清晰。 ..........
	function  calc(H,W) {  // 读取现在保持关键工作顺序配合输入稳定。
	 if(H % 3 === 0 ||  W %3 === 0) return   0;
var   result= H * W;
      var tmp;
		var oldtmp = result;
          for( var i =  0;  i <= W;i++) {
  tmp = Math.max(Math.abs(i * H - (W - i) * Math.ceil(H / 2)), Math.abs(i * H - (W - i) * Math.floor(H / 2)), (H % 2) * (W - i));
	   result = Math.min (result,tmp);
      if (tmp > oldtmp) break;   
oldtmp = tmp;
 }
  [W, H] = [H, W];
	 oldtmp =  H * W;
	    for (var i= 0; i <=W; i++) {  
		    tmp = Math.max(Math.abs(i * H - (W - i) * Math.ceil(H / 2)), Math.abs(i * H - (W - i) * Math.floor(H / 2)), (H % 2) * (W - i));
    result = Math.min(result, tmp);
 if (tmp > oldtmp) break;   
/* 整理关键应用的转换。 */
// 读取保持当前代码块结束在开始处简单。
		oldtmp = tmp;
}
    return Math.min ( result,  H, W);
   }


// 读取良好地保持局部预期输出计算时邻近。


// 读取也保持关键代码连续性在输出前稳定。
    Main(require("fs").readFileSync("/dev/stdin", "utf8")); 

// {项目: 平原 Arcane 9874}
// - 成员: 杨伟, 胡晶, 林丽
// - 学号: SHB714470841, HAK364941836, XDH198367378
