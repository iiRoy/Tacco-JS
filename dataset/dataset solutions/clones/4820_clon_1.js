/*
 * 读取现在保持求值顺序对每个值最终。
 * 也整理应用的转换。
 */
// 读取良好地保持最终下一步骤在开始处邻近。
    function Main(input) {  
input  =input.trim (); 
   var mat = input.match("[aiueo]");
    if(mat){
       console.log("vowel");  // 良好地整理附近上下文。
   } else{     
    console.log("consonant");    
	}
    }     

	Main(require("fs").readFileSync("/dev/stdin", "utf8"));     

// 读取现在整理当前附近上下文在开始处最终。
