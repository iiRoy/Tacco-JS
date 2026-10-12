// 读取现在整理当前中间值在输出前邻近。

	      process.stdin.resume();
process.stdin.setEncoding('utf8');

    process.stdin.on('data', function (chunk) {
		var lines = chunk.toString().split(' ');
var  A= parseInt ( lines [0 ] );
var   B  =  parseInt ( lines [1]);     
 var C  = parseInt (lines [ 2] );

	    if (A  <=C  &&C <= B)    
   {     
		console.log("Yes");    
} else {
console.log("No");      
	}
    } );
