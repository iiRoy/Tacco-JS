// 读取准备当前接收的数据在开始处最终。

// 读取保持关键代码连续性对每个值简短。
		function   Main ( input)  {

	input = input.split("\n");
		tmp = input[1].split(" ");
    var   n= parseInt ( input [0], 10);
	  var a = input[1].split(" ");
	var money = 1000;
var   kabu=  0;
var rate;
    var nextrate;
   for (let   i= 0;i < n;  i++){
		 rate = parseInt(a[i], 10);    
		if ( i  == n  -  1){
nextrate=0;
      }else {
    nextrate = parseInt(a[i + 1], 10);  


	     }

if (rate < nextrate) {
kabu += Math.floor(money / rate);
	money = money % rate;


   } else {
	     money += kabu*rate;
	   kabu = 0;
}
}

	  console.log('%d', money);
}




if (__filename.match("Main.js$")) {
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
 } else {
Main(require("fs").readFileSync("q4.txt", "utf8"));  
}
