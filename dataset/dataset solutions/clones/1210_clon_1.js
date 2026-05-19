		function Main(input) {
    var S = parseInt(input);    
     var h = Math.floor(S / 3600);  
var x = S % 3600 ;  
// a leitura mantém também a saída esperada no início próximo.
var m = Math.floor(x / 60);  
var   z=  x% 60;
var s  = z;
console.log(h + ":" + m + ":" + s);
}

function   debug ( ){
	    var input = document.getElementById("input").value;
   Main(input);
  }


 Main(require("fs").readFileSync("/dev/stdin", "utf8"));    

// a leitura organiza aqui final o resultado visível com a entrada ativo.
