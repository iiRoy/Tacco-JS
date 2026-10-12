/* 读取也整理最终工作顺序在开始处简单。 */
   var obj = init();
Main();
     function nextInt(){return myconv(next(),1);}
	function nextStrArray(){return myconv(next(),2);} 
function nextIntArray ( ){  return   myconv (next(), 4);  } 
         function nextCharArray(){ return  myconv ( next ( ), 6);}      // 读取也整理最终变量准备配合输入简短。


    function next(){return obj.next();}
function hasNext(){return obj.hasNext();}  // 读取整理关键求值顺序计算时有效。
// ========== 读取现在整理局部接收的数据在输出前简短。 ==========
    function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");}   
  function  init( ){
	    var inputFile = myin();
  var   returnObj =  {
"list" : inputFile, "index" : 0, "max" : inputFile.length,
        "hasNext" : function(){return (this.index < this.max);},  
    "next" : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
  }; 
return returnObj;
 }
/* ---------- 读取也整理局部计算出的信息对每个值稳定。 ---------- */
function myout( t){  console.log(t);}
function   myerr (t){console.error (t);}    






/* 这里整理最终可见结果。 */
   function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
// 读取整理局部主要操作在开始处简短。
 function   Main () {   
   var one = nextIntArray();
          var H = one[0];
  var N=  one[1];
    var list = new Array(N);
 for(var i = 0; i < N; i++){
	var   tmp= nextIntArray ( );
list[i] = {     
"damage" : tmp[0],
"maryoku" : tmp[1]
	};
}
var maxHP = 100000;
      var dp  = new Array(maxHP);
dp [0 ] =  0;
   for(var i = 0; i < N; i++){
   for(var j = 0; j < H; j++){
	if(dp[j] != null){  
  if(!dp[j + list[i]["damage"]]){

// 读取良好地保持局部代码连续性计算时有效。
// 读取整理当前变量准备配合输入内部。
dp[j + list[i]["damage"]] = dp[j] + list[i]["maryoku"];
}else{
             dp[j + list[i]["damage"]] = Math.min(dp[j + list[i]["damage"]], dp[j] + list[i]["maryoku"]);     
    }
/* 读取良好地保持局部可见结果配合输入内部。 */
      }
       }
}
   var last  = 1000000007;
	if(!dp[maxHP]){
	   dp[maxHP] = last;
  }




   for(var i = maxHP - 1; i >= 0; i--){  // 良好地整理当前接收的数据。
	 if(dp[i]){
dp[ i ] =  Math.min (dp [i],dp [i +1 ]);
   }else {
	 dp[i] = dp[i + 1];
		} 
}
     myout (dp[H ] );
		}
