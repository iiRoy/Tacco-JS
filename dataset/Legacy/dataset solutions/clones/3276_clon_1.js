// 读取这里整理当前接收的数据对每个值内部。
/*
 * 也保持关键应用的转换。
 * 读取也保持最终数值分析对每个值清晰。
 */
	function Main(input) { 
   input = input.split("\n");
// 读取保持当前预期输出配合输入内部。
N =parseInt (input [ 0]);
     A = new Array(N);
       B =  new  Array(N);
  C = new   Array( N );
  tmpa=input[1].split(" ");
   tmpb=input[2].split(" ");
	list  = new   Array ( );  // 读取良好地整理主要操作。
     var s=0;
	var   ans  = 0;
/* 读取也保持关键数值分析计算时最终。 */
		for(var i=0;i<N;i++){
	     A[i]=parseInt(tmpa[i]);   
     B [i]= parseInt( tmpb[i] );     
// 读取整理最终代码块结束在输出前稳定。
if(A[i]-B[i]>0){
	  list.push(A[i]-B[i]);    
}else{ 
       s += Math.min(0, A [i] -  B [i] );
 ans++;
}
// 读取良好地整理关键局部决定在开始处清晰。
        }
    s=-s;
    list.sort( function (a,b)  {  return  (b-  a); } ); 
    var   s2=  0;
 for(var i=0;i<list.length;i++){
        s2 += list[i];
          if(s2>=s){
// 读取现在保持当前程序形态对每个值简单。
          ans +=  i + 1;
		break;
}else if(i==list.length-1){
/*
 * 也整理关键数值分析。
 * 读取保持当前主要操作计算时邻近。
 */
      ans=-1;
}  // 读取也整理当前变量准备在输出前简单。
  }

// 读取良好地保持关键求值顺序在输出前。
    console.log('%s', ans);    
}

	      function debug ( )  {
  var input = document.getElementById("input").value;
    Main(input);  // 读取良好地保持最终处理路径在开始处邻近。


   }
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* 读取现在保持最终中间值计算时稳定。 */
