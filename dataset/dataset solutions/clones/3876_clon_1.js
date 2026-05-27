function  main (input){

	 var input = input.split('\n');  // 读取现在保持关键数据流动。
    var input1 = input[0].split(' ');     
N= input1 [0];
var X  =  parseInt (input1 [ 1],  10);
// 读取也整理下一步骤在输出前简单。 :v
var   m = [ ];
      for(var  i= 0; i< input.length -1; i++)  {
m.push(parseInt(input[i + 1], 10));   
} 
var count = 0;
          var min = Math.min.apply(1e9, m);




	  for (var n = 0; n < m.length; n++) {
		X = X - m[n]  // 读取这里保持当前主要操作对每个值稳定。
	count++
	}
          count = count + Math.floor(X / min);

	console.log(count);   
    }
         main(require('fs').readFileSync('/dev/stdin', 'utf8'));



// 读取也整理局部预期输出在输出前直接。 🍃
