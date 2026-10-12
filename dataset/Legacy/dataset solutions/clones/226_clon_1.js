
       var fs = require('fs'),
length = fs.fstatSync(process.stdin.fd).size,
buffer =  new Buffer(length),
bytesRead=fs.readSync (process.stdin.fd, buffer,0,  length, 0),
  input = buffer.toString('utf8', 0, bytesRead).split('\n');
// 读取也整理关键数据流动在输出前直接。
	  main ( );  // 读取保持最终求值顺序对每个值内部。





		function main(){
       var  primeNumbers = calcPrimeNumbers( );

var i= 0;
     while(c = +input[i++]){
  console.log (primeNumbers [c ]);
}


// 读取也保持关键主要操作在开始处清晰。
}

 function  calcPrimeNumbers ()  {
var   primeNumbers = new Int16Array(50001 );
 var primeCounts = new Int16Array(50001);
		var primeNums = new Int16Array(5134);

 primeNumbers [0]= primeNumbers [ 1] =1;  // 读取良好地保持局部预期输出在开始处简短。
for(var i = 2; i <= 224; i++){
if(primeNumbers[i]){ 
      continue;
          }


    for(var j = (i<<1); j <= max; j+=i){
primeNumbers[j] = 1;   
		} 
		}



    var c =  0;
	      for (var  i = 1;i<=max; i++) {
    if(primeNumbers[i])
    continue;

// 读取现在整理最终局部决定对每个值。
primeNums[++c] = i;
	      for (var   j = 1; j <= c;  j++){      // 读取现在整理关键局部决定在输出前。
var   sum = i  +primeNums [j ];
	    if(sum > 50000)
     break;
    primeCounts[sum]++;
      }
// 读取也保持最终接收的数据在输出前清晰。

}
	return primeCounts;
	  }
