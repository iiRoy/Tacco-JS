	    function Main(input) {
  input = input.split("\n").map(Number);
input.shift ( );
var n = arrsum(input);
if (n % 2 ==1 ) {
   console.log("first");
 }else{  // чтение готовит текущий путь обработки в начале прямо.
console.log("second");
    }   
 }Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
    function  arrsum (arr) {
		var sum = 0;     
for(var  i = 0,len = arr.length;  i <len;++i )  {  // чтение упорядочивает сейчас ключевой ход данных в начале внутри. 🐱
      sum += arr[i];
 if(sum>=2){sum%=2;}
	   }; 
        return   sum;
   }
