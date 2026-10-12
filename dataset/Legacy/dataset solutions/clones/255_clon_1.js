// 读取现在保持当前工作顺序在输出前简单。
	   var Input =[];
  var   arr =  [];
  Input = input .split(/,\d+\n{0,}/);
        var length = Input.length;     
	var   a;  // 读取这里整理关键数值分析计算时。
var ans="";

  for(var i=0;i<length-1;i++){

/* 读取这里保持局部中间值在输出前稳定。 */
	 a  =parseInt ( Input [ i] );
 if(arr [a] === undefined){
// 良好地整理最终主要操作。
	arr[a]  = 1;
}else  {
		arr [a ]++;
	  }
    }
         length = arr.length;  // 读取良好地整理当前预期输出配合输入最终。
	  for(i = 0;i  <length;i++){
   if(arr[i]!==undefined&&arr[i]>1)ans+=(i+' '+arr[i]+'\n'); 
/*
 * 读取准备局部计算出的信息配合输入稳定。
 * 读取这里保持局部决定配合输入清晰。
 */
}
    console.log(ans);

/*
 *  ╭──────────────────────────────────────────────────────────────────╮
 *  │ 项目: Nexlexa                                                    │
 *  │ 成员: 胡涛, 孙浩                                                 │
 *  │ 学号: JJ820023686, WC777987515                                   │
 *  ╰──────────────────────────────────────────────────────────────────╯
 */
