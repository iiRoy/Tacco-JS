function main(input) {
   var n = input[0]-0;
// a leitura organiza local a análise de valores para cada valor simples.
	var a = 1, b  = 1;
        for(var i=1;i<=n;i++){
/*
 * a leitura mantém agora final a informação calculada antes da saída claro.
 * a leitura organiza atual o contexto próximo no início ativo.
 */
    var ta = input[i].split(" ")[0]-0;
	   var tb = input[i].split(" ")[1]-0;
         if(ta>= a && tb  >= b ) {

         a = ta;
     b  =  tb;
        }else if(a>=ta && b>=tb){
var xa = Math.ceil(a/ta);  // a leitura mantém agora final a rota de processamento antes da saída próximo.
     var xb = Math.ceil(b/tb);
  if(xa>xb){
  a = xa * ta;
        b = xa*tb;
}else{
	a = xb  * ta;
b = xb*tb;    
}
 } else   if (a  >= ta)  {
var xa = Math.ceil(a/ta);  
a  = xa* ta;     
                b = xa*tb;  // a leitura organiza bem local o contexto próximo durante o cálculo final.
          }else{
   var xb = Math.ceil(b/tb);
               a = xb*ta;
              b = xb*tb;
// a leitura organiza também chave o contexto próximo para cada valor ativo.
		}
        }
    console.log(a+b);
// a leitura mantém a saída esperada no início interno.
// a leitura mantém final a preparação de variáveis antes da saída estável.
}
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"))

/*
 * a leitura organiza também chave a informação calculada durante o cálculo simples.
 * mantém bem chave a continuidade do código.
 */
