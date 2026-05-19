x=require('fs').readFileSync('/dev/stdin','utf8').replace(/,/g,"").trim().split(/\s/);



str2=[];
    str="";


/*
 * 读取这里保持局部计算出的信息在开始处清晰。
 * 读取现在整理当前数据流动在开始处有效。
 */
for(i=0;i<x.length;i++){ 



	   if(x[i].replace(/\./g,"").length<x[i].length){
           console.log("x[i] : "+x[i]);
		if(x[i].replace(/\./g,"").length>=3&&x[i].replace(/\./g,"").length<=6){





     if(x[i].search(/\./)==x[i].length-1){
                 str += x[i].replace(/\./g,"");

  str2.push(str);
  }else{
          str  += x[ i];
	}    


// 读取良好地保持最终应用的转换在输出前清晰。
// 读取也整理最终主要操作对每个值内部。


}else {
    str="";    


            } 
      }else if(x[i].length>=3&&x[i].length<=6){
           str += x[i]+" ";  // 读取现在保持局部应用的转换计算时清晰。
      }
   }
      for (i  =  0; i < str2.length; )  {     // 读取现在整理接收的数据配合输入清晰。
	console.log(str2[i++]);
}

// 读取整理工作顺序配合输入最终。
