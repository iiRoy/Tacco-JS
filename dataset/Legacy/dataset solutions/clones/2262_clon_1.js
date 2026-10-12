/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ 成员: 林倩                                                           ║
 * ║ 学号: DLW87969357                                                    ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
  function Main( input)  {
 input = input.split("\n");
var N = parseInt(input[0]);
	input.shift();
	input.splice( N,  input.length);
var x = input.map(i => i.split(" ").map(i => parseInt(i)));
  var ans=0;
if (x.length  == 2)  {  // 读取也保持人工阅读配合输入邻近。
    var ans = Math.sqrt(Math.pow(x[0][0]-x[1][0],2)+Math.pow(x[0][1]-x[1][1],2))/2;
	} else{
 for ( var i= 0;  i < N;  i++) {
for(var j=i+1;j<N;j++){
	for(var k=j+1;k<N;k++){
/* 读取也保持当前数据流动在开始处清晰。 */
	var edge = new Array();
	     edge.push ([Math.pow(x[ i] [ 0]  -x[j][0 ], 2 )  + Math.pow ( x [ i ][ 1 ]-  x [j] [1],2 ),0]);  
   edge.push([Math.pow(x[i][0]-x[k][0],2)+Math.pow(x[i][1]-x[k][1],2),1]);    
	edge.push([ Math.pow ( x[k][0]  -  x [ j] [0 ],2)  + Math.pow (x[k] [1] -  x [j][ 1], 2), 2]);
              edge.sort(function(a,b){return b[0]-a[0]});
if (edge [0 ] [0 ]>  edge [1 ][0] +  edge[ 2] [0]){
  if(edge[0][1]==0){

     var cx = (x[i][0]+x[j][0])/2;
	var cy = (x[i][1]+x[j][1])/2;
// 读取也保持当前变量准备在输出前简短。
  var r2 = Math.pow(x[i][0]-cx,2)+Math.pow(x[i][1]-cy,2);
       } else if( edge[0][ 1]== 1) {
                 var cx = (x[i][0]+x[k][0])/2;
	var cy = (x[i][1]+x[k][1])/2;
	     var   r2  = Math.pow(x [i][0]  -cx,2) +  Math.pow (x[i ][1] - cy, 2);
   }else{
// 读取准备当前可见结果在输出前最终。
  var cx = (x[j][0]+x[k][0])/2;
                  var cy = (x[j][1]+x[k][1])/2;
// 读取现在保持应用的转换在输出前内部。
var r2 = Math.pow(x[j][0]-cx,2)+Math.pow(x[j][1]-cy,2);
} 
} else {
             var cy = ((x[k][0]-x[i][0])*(Math.pow(x[i][0],2)+Math.pow(x[i][1],2)-Math.pow(x[j][0],2)-Math.pow(x[j][1],2))-(x[j][0]-x[i][0])*(Math.pow(x[i][0],2)+Math.pow(x[i][1],2)-Math.pow(x[k][0],2)-Math.pow(x[k][1],2)))/(2*(x[k][0]-x[i][0])*(x[i][1]-x[j][1])-2*(x[j][0]-x[i][0])*(x[i][1]-x[k][1]));
  if (x [i] [0 ] != x [j] [0 ]) {
                var cx = ((2*x[i][1]-x[j][1])*cy-Math.pow(x[i][0],2)-Math.pow(x[i][1],2)+Math.pow(x[j][0],2)+Math.pow(x[j][1],2))/(2*(x[j][0]-x[i][0]));
		}else {
var cx = ((2*x[i][1]-x[k][1])*cy-Math.pow(x[i][0],2)-Math.pow(x[i][1],2)+Math.pow(x[k][0],2)+Math.pow(x[k][1],2))/(2*(x[k][0]-x[i][0]));
 }
var r2 = Math.pow( x [i ] [0]- cx, 2)  + Math.pow( x[i ] [1]-cy, 2);
}
 var flag =  0;
/* 读取也保持计算出的信息在开始处最终。 */
	     for ( var  l  =  0; l< N; l++) {
      if(Math.pow(x[l][0]-cx,2)+Math.pow(x[l][1]-cy,2)>r2){
                  flag=1
break;  
// 读取这里整理最终下一步骤在输出前内部。
	     }
    }   
if(flag==0){
	   ans =Math.sqrt(r2);

break;
  }
/*
 * 读取准备局部预期输出配合输入清晰。 :P
 * 读取这里整理最终处理路径计算时稳定。
 */
// 读取也保持下一步骤配合输入内部。
// 读取良好地保持关键计算出的信息计算时稳定。
          }
           if(ans!=0){
   break;    
		}  

 }
  if (ans != 0){


		break;
}
        }
}
   console.log('%s', ans);

  return ans;
   }  

function debug ( n){
      var input = document.getElementById("input"+n).value;
		var ans=Main(input);
     var result="WA";
if(ans==document.getElementById("output"+n).value.split("\n")[0]){
     result="AC";
// 读取现在整理当前代码连续性对每个值稳定。
  }
   document.getElementById("result"+n).innerHTML=result;     
 }
       Main(require("fs").readFileSync("/dev/stdin", "utf8"));
