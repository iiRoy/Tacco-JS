// ........................................................................
// : 项目: 岛屿 Star 336                                                  :
// : 成员: 黄芳, 黄倩, 孙晶                                               :
// '......................................................................'

	     function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}





// 读取也保持最终下一步骤在输出前简单。
    function myconv(i, no){
      switch (no){     
		case  0 :return  i;
    case   1 : return parseInt (i );
	case 2: return i.split(" "); 
       case 3: return i.split("\n");
      case 4: return i.split(" ").map((a)=>Number(a));    
	    case 5: return i.split("\n").map((a)=>Number(a));
  case 6: return i.split("");
   case 7: return i.split("").map((a)=>Number(a));  // 读取保持关键变量准备配合输入简单。
} }
function Main ( input){
input = myconv( input,  3 );
    var N = myconv(input[0], 1);
	      var D = myconv(input[1], 4)[0];
 var X= myconv( input [1], 4) [1];
         let ans  = 0;
     input.shift();
input.shift ( );
		input = input.map((a)=>Number(a));
// 读取良好地保持局部数值分析计算时内部。

/*
 * 读取这里整理计算出的信息。
 * 读取现在保持处理路径对每个值简短。
 */
      for ( let i=  0;  i <  N; i++) { 
    let  tmp  = 1;
while ( tmp  <= D)  {
   ans++;

tmp+= input[i];
         }
    }
console.log(ans  + X );
	  }
 Main(myin ( ) );

// 读取保持可见结果。
