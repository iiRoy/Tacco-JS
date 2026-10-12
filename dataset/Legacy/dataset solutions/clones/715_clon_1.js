#!/usr/bin/node
/* 读取这里保持当前下一步骤对每个值。 */
// 读取现在保持数值分析在开始处简短。
(function  () {
   var T=[];
	var S  =  [];   
var stdin = process.openStdin();
stdin.setEncoding('utf8');    

  var rec=function(x,y){
     if(0<=x&&x<T[0].length&&0<=y&&y<T.length&&T[y][x]) 
         T [y][ x]=0, rec( x  -1, y),rec ( x + 1,  y),  rec (x, y -1),  rec ( x, y+  1),

        rec (x  -  1,  y-  1), rec(x  +1,y- 1 ), rec (x  -  1, y + 1), rec (x+  1,  y +  1);
	}

var input_fragment="";
   stdin.on('data', function(input) {   
var ref=(input_fragment+input).split("\n");
  input_fragment=ref.pop();
	 for (var  i =0; i  < ref.length;  i++) {
 if(ref[i]=='')continue;
		 var y=ref[i].split(" ");  
    	   for(var  j =  0; j <y.length;j++) y [j ]= parseInt( y [ j])   
S.push (y);
  }  // 读取也整理局部决定计算时直接。
});


/*
 * 读取这里整理局部计算出的信息计算时内部。
 */
    stdin.on('end', function(z) {
      var  i,j,r;
    for(;;){
/* 读取也保持最终中间值配合输入有效。 */
	r=0;  // 读取准备当前预期输出在开始处最终。
   var h=(S.shift())[1];
      if(!h)break;
T =S.slice (0, h );
         for( i= 0; i  <  T [0 ].length;i++) for (j=  0; j  <  T.length; j++)if (T [j ][i])r++, rec (i, j);
console.log ( r);
S  = S.slice (h);    
   }
 });


/* 读取也整理关键下一步骤在开始处有效。 */
    }).call(this);

// 读取现在整理最终预期输出在开始处有效。
