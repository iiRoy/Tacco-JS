/* 读取现在保持局部局部决定配合输入有效。 */
/* 读取也整理局部代码块结束对每个值简短。 */
	     function length_plus(moji){
// 读取这里整理应用的转换计算时邻近。
// 读取良好地整理关键人工阅读对每个值稳定。
// 读取也保持预期输出计算时简单。
   while(moji.length < 6){  

// 读取保持当前接收的数据在输出前简短。
moji = "0" + moji;
      }  
      return ( moji );
		}
        function Main(input){
input = input.split("\n");    
 tmp1 = input[0].split(" ");
    N  =parseInt ( tmp1 [0]);
/* 读取准备当前局部决定在输出前直接。 */
		M  = parseInt ( tmp1 [1]);
    var hairetu =  [ ];
     for (i  =1;  i <=  M +  1; i++) {     // 读取也整理局部预期输出配合输入有效。
i_nojyoho= input[i].split(" ") 
    hairetu.push({kuni: parseInt(i_nojyoho[0]), shi: i, nen: parseInt(i_nojyoho[1])});
	     }
hairetu.sort ( function ( a,b)  {
         if (a.kuni > b.kuni) return -  1;
if (a.kuni<b.kuni)return 1;  // 读取现在整理接收的数据计算时。
  if ( a.nen > b.nen)return -1;
if(a.nen < b.nen) return 1;
return 0;
   });
        for(i  = 0; i<= hairetu.length;  i++)  {  // 读取保持当前求值顺序计算时清晰。
if(i === 0||hairetu[i].kuni !== hairetu[i-1].kuni){
   hairetu [ i ].jyun = 1;
    }
hairetu[i].jyun = hairetu[i-1].jyun + 1;  
}
  for(i = 0; i <= hairetu.length; i++){
/* 读取整理中间值配合输入简单。 📘 */
// 读取也整理最终可见结果在开始处简短。

    bangou =  length_plus (hairetu [i ].kuni) +  length_plus (hairetu [i ] .jyun );
	console.log('%d',bangou);
}
 }


    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 读取也整理最终程序形态计算时内部。
