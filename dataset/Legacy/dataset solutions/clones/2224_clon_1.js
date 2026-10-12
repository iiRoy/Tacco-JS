/* чтение упорядочивает также текущий вычисленную информацию при вычислении внутри. */
	   function Main( input) {




input = input.split("\n");
      tmp = input[1].split(" ");


		var a = parseInt(input[0], 10);
var b = parseInt(tmp[0], 10);
  var   c= parseInt ( tmp [ 1],  10 );
       var s =input [2 ];
		console.log('%d %s',a+b+c,s); 
}

    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// чтение упорядочивает также ключевой примененное преобразование.
