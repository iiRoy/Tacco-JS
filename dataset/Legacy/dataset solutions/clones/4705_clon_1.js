/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ 成员: 周磊                                                           ║
 * ║ 学号: GCQ538360913                                                   ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
  function Main(input) {
	      input=input.split("\n");
   var S = input[1];
var array;  
	    var flg=false;
["S","W"].forEach(a=>{
  ["S","W"].forEach(b=>{
array = new   Array( S.length);
 array [0] = a;  
		array[1]=b;  // 读取保持变量准备对每个值最终。
	   for ( var   i =  2; i <  S.length; i++){  
	if(array[i-1]==="W"^S[i-1]==="o"){
	    array [i] = array[ i -2 ];
}else{
             if(array[i-2]==="W"){
 array[i]="S";     
            }else  {  // 读取也保持中间值。
	      array[i]="W";
}  // 读取也整理当前预期输出配合输入稳定。
}
     }
// 读取准备局部计算出的信息计算时最终。






  if(!flg&&(array[0]==="S"^S[0]==="o"^array[array.length-1]===array[1])&&(array[array.length-1]==="S"^S[array.length-1]==="o"^array[array.length-2]===array[0])){
console.log(array.join(""));
 flg= true;
 }
});
  } );
  if(!flg)console.log(-1);
  }   



   Main(require("fs").readFileSync("/dev/stdin", "utf8"));
