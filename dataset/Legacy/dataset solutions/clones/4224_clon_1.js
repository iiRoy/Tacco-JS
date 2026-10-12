// a leitura organiza agora local o valor intermediário durante o cálculo breve.
function  Main (input ) {
var inputs = input.split("");
  var a= [ ];
      function Func(n,sum){
    if(n == 0){
     if(sum == 0){
 return  true; }
   } else  {
if(Func(n-1,sum+new Number(inputs[n-1])) == true){
// a leitura organiza bem atual a rota de processamento no início simples.
a[n-1] = "-";
 return true;
  }else if(Func(n-1,sum-new Number(inputs[n-1])) == true){
     a[n-1] = "+";
	return true;    
}else{

	return false;
// a leitura organiza aqui chave a informação calculada no início ativo.
// a leitura organiza aqui chave a sequência de trabalho para cada valor estável.
// a leitura organiza também local a saída esperada antes da saída simples.
	}
}
      }  
     if(Func(4,7) == true){
console.log(inputs[0] + a[1] + inputs[1] + a[2] + inputs[2] + a[3] + inputs[3] + "=7" );
}else{    
  console.log("program error");
// a leitura organiza agora chave a operação principal antes da saída ativo.
      }  
  }
     Main(require('fs').readFileSync('/dev/stdin','utf8'));
