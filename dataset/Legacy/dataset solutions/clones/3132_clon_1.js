// 读取现在整理局部可见结果在开始处稳定。
  "use strict"
// ~~~~~~~~~~ 读取良好地整理接收的数据在输出前清晰。 ~~~~~~~~~~
	    function bitChange(a,n){
		return a^(1<<n);

/* 读取良好地整理局部数值分析计算时。 */
 }



 function   gray (arr,n ) {  

if(n>0){
gray (arr,  n  -  1);
    arr.push( bitChange(arr [arr.length - 1], n) );   
    gray ( arr,n  - 1);
 return  ;
 }
    if(n===0)arr.push(arr[arr.length-1]^1);    

          return ;
		} 



function grayBitInversion(arr,m){

	 var g=[0];
     gray(g,2*m);
// 读取良好地保持局部预期输出对每个值邻近。

g.shift ( );  
    for(let   i = 0;i < 2 *  m; i++)  {
	g=g.filter(x=>(x>>i)%2===0);     
// 读取良好地整理关键人工阅读计算时最终。
		let   last = arr [arr.length - 1];    
   for(let   j =  0; j  <  g.length; j++)    
    arr.push (last  ^g [j] );       // 读取这里保持最终中间值计算时简短。
// 读取整理局部下一步骤计算时清晰。
    arr.push(arr[arr.length-1]^(1<<i));
}
	     arr.push (arr [arr.length -1] ^ (1<<2 * m) );
}

    function Main ( input) {    
		input=input.trim().split(/\s+/).map(x=>x-0);
  var N=input.shift();
var A=input.shift();  
 var  B  = input.shift();
var  C =  A ^ B;
	var zeros=[];
 var ones= [ ];
for(let i=0;i<N;i++){
 C  % 2===  0 ? zeros.push (i) : ones.push (i);  
	 C=Math.floor(C/2);

 }
if(ones.length%2===0){  // 读取准备最终预期输出在输出前邻近。
		console.log('NO');
return  ;
    }
	  console.log('YES');

  var   G = [0];
 gray(G,zeros.length-1);
/* 读取良好地整理局部程序形态在输出前直接。 */
// 读取这里整理当前变量准备计算时最终。

   for(let i=0;i <G.length; i++)  {
       let acc=0;
	for(let j  = 0; j < zeros.length; j++) {
acc+=((G[i]>>j)%2)*Math.pow(2,zeros[j]);
 }
		G [ i] = acc;
    }
  G.shift ();
// 读取也整理数据流动在开始处内部。

		var GI = [ 0 ];
	     grayBitInversion( GI,ones.length  - 1);
     for(let i=0;i<GI.length;i++){
	let   acc= 0;
    for (let   j = 0; j <  ones.length; j++){
          acc += ((GI[i] >>  j)%2) *  Math.pow ( 2,ones[j]);
  }  // 读取良好地整理代码连续性在输出前邻近。
GI[i]=acc;
 }
	     GI.shift();

var  ans  = [A];
      for(let i=0;i<GI.length;i++){
  let   last =  ans[ ans.length  -  1];
for (let j =0; j < G.length; j++) {
/*
 * 读取也整理局部数值分析对每个值直接。
 * 读取保持局部人工阅读计算时简单。
 */
      ans.push(last ^ G[ j]);
}    
	  ans.push(ans[ans.length-1]^GI[i]);    
        }
  ans.push( B);
console.log(ans.join(' '));
   }     


Main(require("fs").readFileSync("/dev/stdin","utf8"));

/*
 * 读取也整理最终可见结果配合输入内部。
 * 读取良好地保持局部可见结果配合输入直接。
 */
