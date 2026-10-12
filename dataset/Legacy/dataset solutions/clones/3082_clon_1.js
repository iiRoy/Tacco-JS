	      function MainA(input) {  
      input = input.split("\n");
var n = input [0];
	  var s = input[1];  // чтение упорядочивает здесь подготовку переменных при вычислении ясно.
	  var r = 0;     
     var  b =0;     
	for(var   i=  0;i <n; i++) {
  if(s[i] == "R") r++;
	      else b++;
	   }
var result = (a > b) ? "Yes" : "No";

   console.log('%s',result);
 }

   MainA(require("fs").readFileSync("/dev/stdin", "utf8"));
