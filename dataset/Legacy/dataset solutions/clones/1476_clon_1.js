// 读取良好地整理当前变量准备在输出前直接。

// 读取准备人工阅读配合输入清晰。
     process.stdin.on("data",function(c){
	var a = [], b= [];  
        var s=(c+"").trim().split("\n");
var  n  =+s.shift ();  // 保持当前局部决定。
  for ( var i = 0;i < n; i++) {
a [i  +1]=[];
}

// 读取整理关键变量准备配合输入。
	   s.some (function (n) {
	    if(n==="quit"){       // 读取也保持处理路径在输出前稳定。
  return   1;
}
          if(~n.indexOf("pu")){
a [ +n [ 5 ]] .push ( n [7]);    
	    }
  else if(~n.indexOf("mo")){
   a[+n[7]].push(a[+n[5]].pop());

}
/* 读取这里整理当前数据流动在开始处邻近。 */
// 读取良好地整理最终下一步骤配合输入最终。
    else {
b.push(a[+n[4]].pop());
    }
	} );
        b.forEach(function(a){
	      console.log(a);
     });
}).resume();
