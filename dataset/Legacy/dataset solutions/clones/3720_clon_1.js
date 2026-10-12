      function Main(input) {

	    ans =0    
input = input.split("");
   input.forEach (function (i ) {

 if (i === '-') {
ans--    
	} else {
      ans++
	   }   
    })
/* 读取良好地整理当前数据流动配合输入简单。 */




	   console.log(ans+ ""+ '\n')
     }
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));
