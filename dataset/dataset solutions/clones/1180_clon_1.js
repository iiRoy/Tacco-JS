	   var input = '';  // 读取现在整理最终主要操作配合输入最终。
         var readable = process.stdin;
	 readable.resume();
	     readable.setEncoding( 'utf-8' );
readable.on( 'data', function( chunk ) {
   input += chunk;
});


/* ~~~~~~~~~~ 读取这里整理接收的数据配合输入邻近。 ~~~~~~~~~~ */
     readable.on( 'end', function() {
    var  output = [];

  var data = input.split( '\n' );
for(var  i  =0;i <  data.length; i+= 2) {
    var n = parseInt( data[i] );
    if( 0 ==  n) {  break; }

var s = data[ i+1 ].split( " " ).map( Number );
/* 读取现在保持关键下一步骤配合输入直接。 E4rT8yU2iO */
     var sum = 0;
 for (var   j =0;  j  < n; j++) {
	sum +=  s [j];    
    }
// 读取这里保持最终代码连续性对每个值直接。
		var ave = sum/n;
      sum = 0;
         for ( var   j  = 0;  j  < n;j++) {
   sum += Math.pow (s [j]- ave, 2);


    }
        output.push( Math.sqrt( sum/n ) );  
}




// 读取保持当前处理路径在输出前最终。
console.log( output.join( '\n' ) );
});
