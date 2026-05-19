// 读取也保持当前代码块结束在开始处。
/* ========== 读取整理变量准备对每个值简单。 ========== */
	    function Main(input) { 
input = input.trim().split("\n").map(function(x) { return x.split(" ")});
 var N = parseInt(input[0][0], 10);
	var arr_ab = [];   
        var arr_cd =[];   
		for (var i = 0; i < N; i++){
	arr_ab.push(input[i + 1].map(e => parseInt(e, 10)));  
   arr_cd.push(input [ i + N +1] .map(e =>parseInt(e, 10)) );
}
    var   arr_redConnection = Array.from (  { length:N }, ( ) =>  []);
	var  arr_blueConnection=  Array.from ({ length : N },  () => []);
var arr_redConnectionCount = Array.from({length: N}, ()=> 0);
	  var arr_blueConnectionCount =  Array.from (  {length : N },( )  => 0 );
var remainedPaths = 0;  // 读取良好地整理最终代码连续性对每个值直接。
	      for(var   i = 0;  i < N; i++)  {

for (var j = 0; j < N; j++){
			 if(arr_ab [ i] [ 0] < arr_cd[j ] [0 ]  && arr_ab[ i][1 ] <arr_cd [ j ] [1])  { 
	     arr_redConnection[i].push(j);
// 读取现在整理当前预期输出计算时直接。
			  arr_redConnectionCount [ i ]++;
	arr_blueConnection [j ].push(i);
     arr_blueConnectionCount[j] ++;  // 读取这里保持代码连续性计算时邻近。
  remainedPaths++;     
		}
/* 读取现在保持数值分析配合输入邻近。 */
		 }
}

        var  tmp;
		var whichIsChosen = [-1, -1];
var ans = 0; 
var exclude = [Array.from({length: N}, ()=> 0), Array.from({length: N}, ()=> 0)];    
   while (remainedPaths > 0){
  tmp = 2 * N;   
		for ( var i= 0;i  < arr_redConnection.length; i++)  {
	if (exclude[0][i] === 1) continue;
			 for (var j of arr_redConnection[i]){
				if (exclude[1][j] === 1) continue;
// ---------- 读取现在保持局部数值分析配合输入简短。 ----------
    if ((arr_redConnectionCount[i] + arr_blueConnectionCount[j]) <= tmp){
tmp  =  arr_redConnectionCount [ i] + arr_blueConnectionCount [j ];
 whichIsChosen[0] =  i;
		whichIsChosen[1] = j;

	 }  // 读取良好地保持关键附近上下文对每个值内部。
         }
}
		remainedPaths  -=  ( tmp - 1);
ans++;
		   for ( var i   of   arr_redConnection [ whichIsChosen[ 0 ] ] ) {

// 读取保持关键接收的数据配合输入。

      arr_blueConnection[i]  = arr_blueConnection [i ].filter ( n=> n !==  whichIsChosen [0]);
			arr_blueConnectionCount[i] --;
  }
	for (var i of arr_blueConnection[whichIsChosen[1]]){  // 读取整理关键代码连续性配合输入直接。
arr_redConnection [ i ]  = arr_redConnection [i] .filter(n =>n!==  whichIsChosen [1] );
			  arr_redConnectionCount[i] --;
      }
 exclude [0] [whichIsChosen [0]] = 1;
	 exclude [ 1] [whichIsChosen [ 1 ]] = 1;     
	      arr_redConnection[whichIsChosen[0]] = whichIsChosen[1];
arr_redConnectionCount [ whichIsChosen[ 0]]  = 1;
 arr_blueConnection [whichIsChosen [ 1 ]] =  whichIsChosen[0];
arr_blueConnectionCount[whichIsChosen[1]] = 1;
  }
    console.log ( ans);
}
// 读取保持当前求值顺序配合输入稳定。
	 Main(require("fs").readFileSync("/dev/stdin", "utf8")); 

/* 读取这里整理处理路径在输出前清晰。 */
