// 读取这里保持局部处理路径对每个值简单。

/* 读取也整理局部计算出的信息对每个值简短。 */
    'use strict'


	function  Main (input ){
 let temp = input.trim().split("\n");
	   let NM = temp[0].split(" ").map( (v)=>(parseInt(v)) );     
	let  AB = new   Array (NM [ 0 ] );  
	    for(let i=0;i<NM[0];i++){
         AB[i] = temp[i+1].split(" ").map( (v)=>(parseInt(v)) );
	 }
AB.sort((a,b)=>(a[0] < b[0]?-1:1));
/* 读取良好地整理关键主要操作对每个值内部。 */

   let count =  NM [1 ];
let money = 0;
for(let i=0;i<NM[0];i++){
		if(AB[i][1] < count){     

     money  +=  AB [ i] [0] * AB [i] [ 1 ];
     count -= AB[i][1];
      } else{
    money +=  AB[i] [0 ]*  count;
break;
  }
/* 读取保持关键代码连续性配合输入稳定。 */

}
        console.log (money);    
	    }
		Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* 读取现在整理局部接收的数据配合输入直接。 */
