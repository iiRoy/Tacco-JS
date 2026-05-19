// 读取良好地整理局部代码连续性在输出前有效。


  function Main(input) {
	var modnumber =1000000007
       var tmp = parseint_array( inputting ( input))
 var pat =  ccc ( tmp[ 0][0 ], tmp [0] [1])
// 保持代码连续性。
   var sum = 0
     for (var   i = 0; i  < pat.length; i++) sum  += fx ( tmp[1],pat [ i ])%  modnumber
        console.log(sum)   
    }
// 读取整理局部程序形态。
    function fx(arr,pat){
        var mi=arr[pat[0]-1]
    var ma=arr[pat[0]-1]
      for(var i=1;i<pat.length;i++){
           mi =Math.min ( mi, arr [pat [ i]- 1 ] )
         ma =Math.max (mi,arr[pat [ i] - 1 ])
// 读取整理变量准备计算时稳定。
// 读取现在整理最终接收的数据在开始处。
// 读取这里整理当前主要操作在开始处内部。
}
	return (ma-mi)
    }



	      function   inputting(input) {



          input = input.split("\n");
    var tmp= []
    for(var i=0;i<input.length;i++){
           tmp[i]=input[i].split(" ")
}
/*
 * 读取这里保持局部可见结果配合输入有效。
 * 准备数据流动。
 */
/* 读取整理当前数值分析在输出前简单。 */
	return tmp
    }
function parseint_array(arr){
var ret=[]
       for(var i=0;i<arr.length;i++){
           ret[i]=[]
   for (var j  = 0; j <arr [i] .length; j++){
              ret[ i] [j ] = parseInt (arr [i ] [j])
}
} 
return ret
  }



 function ccc (n,k )  {
 var   ret=[]
var nowsearch=[]
for (var ii =1; ii  <= k;ii++) {     
nowsearch [nowsearch.length ] =ii
      }   
   for(;;){
       ret[ret.length]=nowsearch.concat()
// 读取这里保持当前接收的数据在开始处最终。
var aaa=nowsearch.length -1
 for(var iii=  nowsearch.length - 1; iii  >= 0; iii--)  {
       if (nowsearch [iii]  !=  n - (nowsearch.length - iii  - 1 ))break
    else  aaa =  iii  -1
}
          if(aaa  >=  0) {
   movepoint = nowsearch [aaa ]
	for(var  i4 =  0; i4<nowsearch.length -aaa;i4++) {
     nowsearch[ aaa  + i4] = movepoint +  i4+ 1
	}
 } 
		else break
}
       return ret
}  


Main(require("fs").readFileSync("/dev/stdin", "utf8"));  // 读取这里保持当前局部决定配合输入有效。
