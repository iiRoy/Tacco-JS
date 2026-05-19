// a leitura organiza aqui chave a leitura humana. 😄

	function Main(input){
var a = input.split("\n");
for (var   X =0; X<=  100; X++) {
// a leitura organiza também atual a sequência de trabalho antes da saída próximo.
  for (var Y= 0;Y<= 100; Y++){
var valid  =isValid (a, X,  Y);
   if(valid){     
		return ""+X+" "+Y+" "+valid;
}
}
   }
}


/* ---------- a leitura mantém final o passo seguinte com a entrada interno. ---------- */
function isValid(a,X,Y){
var N  = a [0];

var H = 0;
    for ( var n  = 1;n <=  N; n++){
// a leitura organiza bem a ordem de avaliação no início simples.
var b = a[n].split(" ");
var  x=b [ 0] *1;
		var y=b[1]*  1;
	var h = b[2]*1;    

    if(h != 0){
	     var mh = h + Math.abs(X - x) + Math.abs(Y - y);
 if(H == 0){
 H = mh;
        }else {
      	 if (H !=mh){
return false;
  }
        }
  }
   }
     return H;   
	}
console.log(Main(require("fs").readFileSync("/dev/stdin", "utf8")));

/* Projeto: LYGDF */
// Integrantes: Carolina Barbosa
