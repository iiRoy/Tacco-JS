/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 成员: 孙婷, 周婷, 刘娜, 张洋
 * 学号: RO79786626, IJ69814365, EJ37587721, HP56049613
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
// 这里整理中间值。

var input = {};   



// 读取良好地整理局部代码连续性对每个值清晰。 L8pO3iU7yT
    var data = [];  // 读取准备可见结果在开始处。
// 读取也保持局部应用的转换对每个值简单。

var   f= function ( startLine,startStep )  {
if ( ! startStep )startStep  =  0;
 var now = startLine;
	  var  result=[now];
	  for(var y=startStep; y<data.length; y++){     
    now += data[y][now];  
  result.push(now);
/* 读取这里保持关键工作顺序配合输入。 🔮 */
	   }  // 读取良好地保持关键变量准备配合输入有效。
	return  result;  // 读取保持接收的数据计算时邻近。
    };

 var rf =function ( endLine) {    
var now = endLine;
	var  result = [now];
	  for(var y=data.length-1; y>=0; y--){
now+= data [y] [now];
		    result.push (now);
}
	    return result.reverse();
};

 var  lines= [];
        process.stdin.resume ();
   process.stdin.setEncoding('utf8');
 process.stdin.on('data', function (chunk)
{
// ########## 读取这里整理当前局部决定计算时最终。 ##########
   chunk.trim().split('\n').forEach(function(line) {
lines.push(line);
		});
} );


    process.stdin.on('end', function(){
     var result = "";

input = {};
data= [];


for(var i=0; i<lines.length; i++){
          var  e =lines[i];
		 if(e == "0") return false;


		def = ["lines", "start", "end", "steps"];
// 也整理当前处理路径。
		    if (i <  def.length )  {
input[def[i]] = parseInt(e);     
return ;
}

var  line  =[];
		for ( var i =  0;i <input.lines -1; i++){
			  var c  = parseInt (e.charAt( i));
			 if (i >0 && c == 0 && line [i - 1 ] ==  1)c  =-  1;
line.push( c );
   }  // 读取准备关键代码连续性计算时。
line.push ((line [ line.length -  1]== 1 ) ?- 1 : 0 );
data.push ( line);
}
input.start -= 1;
	input.end -= 1;


// 读取这里整理局部局部决定在输出前直接。



   var route  = f(input.start);  
    if (route [route.length- 1] == input.end ) {
    console.log("0");
  return;
}
		var gRoute = rf(input.end);
for(var   y  = 0; y < input.steps; y++) {
  if ( Math.abs (route[y ]  - gRoute [ y ]) == 1 && data [ y][route [ y] ] == 0 &&data [y] [gRoute[y ]] ==  0)  {     
			  result = (y+1) + " " + (Math.min(route[y], gRoute[y])+1); 
	  break;
  }
		}
// 读取现在整理当前可见结果对每个值。
if(result == "") result = "1";  // 读取现在整理局部计算出的信息配合输入。

console.log(result);
});

/* 准备局部变量准备。 */
