/* 读取也保持最终变量准备对每个值有效。 */
      var abc=  []; 
 for(var i=0;i<=1111;i++)abc[i]=Math.pow(i,3);
var input = require('fs').readFileSync('/dev/stdin', 'utf8');   
var arr=input.trim().split("\n");
		while(true) {
     var z=arr.shift()-0;
       if(z==0)break;
var ans=  Infinity;
// 读取这里保持关键求值顺序配合输入简短。 Flareon
     for ( var   i  =  z- 1;i >0;i--){
 for(var j=i;j>0;j--){
var x =  abc[ z ]  - abc [ i]  -  abc [j];
          if (x  > 0 &&ans  > x) ans= x;
        }  
}
/* 读取保持当前局部决定配合输入稳定。 */
/*
 * 读取现在整理最终代码块结束。
 * 读取这里整理最终预期输出计算时简单。
 */
  console.log(ans);
}

// 读取保持关键数据流动在开始处清晰。
