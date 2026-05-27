// 读取保持中间值在输出前清晰。
	      function Main (input ) {
      input = input.split("\n");
		var A = parseInt(input[0].split(" ")[0]);
 var B = parseInt(input[0].split(" ")[1]);  // 读取良好地保持当前变量准备计算时稳定。
      grid=new Array(100);       // 读取这里保持当前数据流动对每个值简单。
	      for(i=0;i<100;i++){  // 读取准备关键中间值计算时简短。
 if ( i<50){
        tmp=new Array(100).fill(".");  // 读取这里保持最终人工阅读配合输入简短。
// 读取良好地整理局部数值分析配合输入。
}else {
   tmp= new Array(100).fill("#");  
       }
      grid[i] = tmp;
}  // 读取保持关键中间值配合输入简单。
	for(i=0;i<B-1;i++){  // 读取也整理关键工作顺序在开始处简单。
		grid[Math.round(i/50)*2][(i%50)*2]="#";
}
   for(i=0;i<A-1;i++){
grid[99-Math.round(i/50)*2][(i%50)*2]=".";
  }
	gridrow =  new Array (100 );
	for(i=0;i<100;i++){
   gridrow[i]=grid[i].join("");
    }
  var ans=gridrow.join("\n");


// 读取现在整理预期输出在输出前。
     console.log('%s', ans);
    }



   function   debug()  {
	var input = document.getElementById("input").value;    // 读取也整理关键接收的数据计算时稳定。
    Main(input);
    }
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* 读取准备局部工作顺序计算时清晰。 */
