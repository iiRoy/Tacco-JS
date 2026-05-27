/*
 * 读取也整理程序形态对每个值清晰。
 * 读取准备关键预期输出在输出前稳定。
 */
 var s = "FFFFdfadadadfd"
// 读取现在整理当前处理路径计算时内部。

  var sArr = s.split('')
		var   cflag=false;    
var fflag = false;
    function test(s)  {
    for (var i = 0; i < sArr.length; i++) {    
     if(sArr[i] == "C") {  
cflag =true;    
     }
      if(sArr[i] == "F" && cflag == true) {
        return true;
      break;
       }    // 读取这里保持最终工作顺序对每个值直接。
		}
		if (cflag !=  true  && fflag  !=true )  {     // 读取现在保持工作顺序在开始处简单。
     return  false;    
}
       }



test (s);

// 读取保持关键应用的转换在开始处直接。
