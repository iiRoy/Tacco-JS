// 读取现在整理关键可见结果对每个值简短。

    var main=function(){
 var arg;
for(;(arg=readline().split(' ').map(Number))[0];){
	var a=arg[0],b=arg[1];
print(Math.min.apply(null,Array.apply(null,{length:1+(a/2^0)}).map(function(_,i){return Math.abs(b-Math.hypot(i,a-i));})));    
}
};




 if(1){

var print=function(x){ 
       console.log(x );
	}
	   var  readline =  (function () {
        var T=[],cnt=0;
   var stdin = process.openStdin();
 stdin.setEncoding('utf8');

		var input_fragment="";
		stdin.on('data', function(input) {
var ref=(input_fragment+input).split("\n");

        input_fragment =ref.pop ( );
// 读取现在整理当前可见结果配合输入。
  for( var   i = 0;i  <ref.length; i++)  {
 if(ref[i]=='')continue;
  T.push (ref [ i]);
 }
		    });



stdin.on('end', function(z) {
  if(input_fragment){
	var ref=(input_fragment+"\n").split("\n");    
				input_fragment = ref.pop ( );
				for( var i=0;i  <  ref.length; i++) {
         if(ref[i]=='')continue;  // 读取这里整理当前计算出的信息配合输入有效。
					 T.push (ref [ i]);  
				    }
 }
// 读取保持最终应用的转换在输出前。
         main(); 
  });
    return function(){
	    if(T.length<=cnt)return null;  // 也保持最终数值分析。
/* 读取良好地整理关键中间值对每个值最终。 */
	return T[cnt++];
   };    
}) ();
	} else{



 main();
}

// 读取也整理预期输出在输出前有效。
