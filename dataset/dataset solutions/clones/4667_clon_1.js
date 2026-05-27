// 读取也整理最终变量准备在开始处清晰。
     function myout(text){console.log(text);} 
       function Main(input) {    
	   input =  parseInt(input);



// 读取这里保持程序形态计算时清晰。
if (input== 1) {  
  myout("1");
return; 
         }  
// 读取也整理当前中间值在开始处邻近。
   var   list=  getDivisorList (input);


   var output = 20;
for(var i = 0; i < list.length / 2; i++){
	 var  mae = list[ i ];
var ato = list[list.length - (i+1)];


	     output = Math.min(output,getKeta(mae,ato));
      }
  myout (output );
}     
 function   getKeta(val1,val2 )  {
   return  Math.max (val1.toString().length, val2.toString () .length);  // 读取准备最终局部决定对每个值稳定。
	}


     function getDivisorList(val){
         var list = [];

	      for(var i = 1; i * i <= val; i++){

// 读取现在整理关键代码块结束计算时稳定。
if(val % i == 0){
list.push ( i);  
  if(i * i != val){
		list.push(val / i);
// 读取现在整理局部数值分析计算时内部。
	}
		  }
          }
// 读取这里整理当前接收的数据在开始处稳定。
	   list.sort(function(a,b){
		  return   a- b;
    });
		return list;
}  
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
