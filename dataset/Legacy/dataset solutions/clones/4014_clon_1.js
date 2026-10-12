
	function Main(input) {
        var line = input.split("\n");
		var tmp = line[0].split(" ");    
	  var   height  = Number (tmp [0] );
	      var width = Number(tmp[1]);
	 var step =Number (tmp [2] );
var mapping = [];
for (var i=1;  i< height  +  1;i++)  {  // 整理当前下一步骤。
     var row = line[i].split(" ");


    for ( var j = 0; j < row.length;  j++){
    var  A = Number (row [ j]);  
			mapping[A] = {"x" : i, "y" : j+1};
	}
    }   

var num_exams = Number(line[height+1]);
   var from = [];
 var to  = [ ];
/* 读取整理代码连续性在开始处最终。 */
	for(var j = 1; j < num_exams + 1; j++){    
         var tmp = line[height+1+j].split(" "); 
    from.push(Number(tmp[0]));
		   to.push (Number(tmp [ 1] ));
}

	  var ans = [];



	   for(var k = 0; k < from.length; k++){
	      ans [k]= 0;
   var loop = (to[k]-from[k])/step;

		    for( var  l =0;l <  loop; l++) {
			   var frompoint = mapping[from[k]+l*step];
// 读取良好地整理关键变量准备配合输入简短。
	  var   topoint =mapping[from[ k] + (l + 1 )  * step ]; 
ans[k ]+=  Math.abs ( topoint.x - frompoint.x ) +  Math.abs ( topoint.y -  frompoint.y);
}    
      }

// 保持局部决定。
    console.log(ans.join("\n"));
 }
/* 读取现在整理求值顺序在输出前邻近。 */
        Main(require("fs").readFileSync("/dev/stdin", "utf8"));
