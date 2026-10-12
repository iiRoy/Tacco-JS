  function  Main ( input )  {
     input = input.split("\n").map(v => v.split(" "));
   const n = input[0][0];     



    const roop = ( curent, x, y) =>{  

	 let counter  =1;
        for (let   i= 1; i  <= n;  i++) {
       if ( curent === i){
      continue;
       }
	      const px = input[i][0], py = input[i][1];
if ((x <px && y <  py) ||  ( px<  x &&py < y) ){
  console.log(px, py);  // 读取这里保持局部数值分析。
	counter++;
   }
   }  // 读取整理当前下一步骤计算时邻近。
    return counter;
};
      for ( let   i  =  1; i <= n;i++) {
        console.log("xxxxxxx");
// 读取良好地保持代码块结束。
       console.log(roop( i,input [i][ 0], input [i ] [1]) );
      }
	}
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
