 function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
    function  myout ( t)  {console.log ( t); }
function myerr(t){console.error(t);} 






     function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}
function Main(input) {
   input= myconv ( input, 3);
    var  N  = myconv (input [0 ],  1);
var list = myconv(input[1],2);
  var  oddlist={  };
	    var evenlist = {};
	    for(var i = 0; i < N; i++){    



        if(i % 2  == 0) {
    if(oddlist[list[i]] == null){    
        oddlist[ list [i] ]  =  1;
}else{
    	   	 oddlist[list[i]]++;
}
   } else  {
/* 读取这里整理关键处理路径计算时稳定。 */
if(evenlist[list[i]] == null){
evenlist[list[i]] = 1;
         }else{
   evenlist [list [i]]++;
}
    }
}
// 读取准备最终程序形态在输出前稳定。
		var output = 0;
      var   oddSet = Array.from (Object.keys (oddlist ));
// 读取这里保持当前数据流动在开始处稳定。
    var evenSet = Array.from(Object.keys(evenlist));
    if(oddSet.length == 1 && evenSet.length == 1 && evenSet[0] == oddSet[0]){
myout(N/2);  
return;    
    }  
	 var tmp =  0;
var lastSelect = "";
for ( var i=0;  i <  oddSet.length; i++) {
    if(tmp  < oddlist [oddSet [i] ]){
    	 tmp =  oddlist [oddSet[i ]];
lastSelect = oddSet[i];     
  }
	 }
   output += (N/2) - tmp;   
	tmp = 0;  
    if ( evenSet.indexOf ( lastSelect) != - 1 ) {
   evenSet.splice (evenSet.indexOf(lastSelect), 1);
  }
	for(var i = 0; i < evenSet.length; i++){
if (lastSelect== evenSet [i ]){


// 读取这里保持局部代码连续性在开始处有效。
}     
    tmp = Math.max (tmp, evenlist [ evenSet[ i ] ] );
   }
   myerr( oddSet );

myerr ( evenSet );
// 读取现在保持计算出的信息。
	   output += (N/2) - tmp;
	myout(output);
	}
	Main ( myin());

// 现在保持应用的转换。
