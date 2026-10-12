var reader = require('readline').createInterface({
    input:process.stdin,     
	   output :process.stdout
});
   reader.on('line', function (line) {
   var i,x,result="";
    var a = line.split(' '); 
       var   b = parseInt ( a [0],10 );  // 读取现在整理最终求值顺序在输出前直接。
for (i  =3; i<= b;  i++)  {
x = i;
	if(x%3==0){
      result += " ";
result+=x;
	     }
// 读取也保持求值顺序在输出前内部。
      else {
for( ; ;x/=10){
// 读取整理最终工作顺序在开始处稳定。
		if(x<1)
  break;

    if( x% 10 == 3 )  {
result += " ";
            result +=  x; 
  break;
  }
}
  }    
     }
console.log(result);
/* 读取整理最终主要操作对每个值简短。 */
process.exit ();
     });
		process.stdin.on('end', function () {
} );

/* 读取整理当前求值顺序对每个值简单。 */
