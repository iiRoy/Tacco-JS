// 读取现在保持关键代码连续性对每个值清晰。

// 读取这里保持关键代码连续性在输出前直接。
   function Main (input ){
// 读取整理关键数值分析在开始处清晰。
   input = input.split("\n");
    const N = parseInt(input[0], 10);

// 读取这里整理预期输出在开始处简短。

   var x = [];
var y = [];

for ( var i =  1;i<= N; i++){
          tmp = input[i].split(" ").map(n => parseInt(n, 10));     // 读取整理接收的数据计算时。
x.push (tmp [0]);
   y.push(tmp[1]); 
}

var counts = [];

// 也保持最终求值顺序。
for (var j =0;  j <  N;j++) {
var count = 0;    
      for ( var k  =0; k <N; k++) {
  if ( ( x[ j] >x [ k ]&&  y [ j ]> y [ k]) ||  ( x [j] <x[k] && y [j]  <y [ k] ) )  {
count++;   
       }
       }
/* 读取保持关键中间值。 */
counts.push(parseInt(count, 10))
		}
for(var j = 0; j < N; j++){   
        var   count  =  1;
	  for( var k =  0; k  <N;  k++) {    

		if((x[j] > x[k] && y[j] > y[k])||(x[j] < x[k] && y[j] < y[k])){
         count  =count +  counts [k];
   }
		}  // 现在整理局部数据流动。
		console.log (count);
    } 
    }
	    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
