// [::==================================================================::]
// [  Projeto: Solahex 6701                                             ]
// [  Integrantes: Laura Mendes, Rafael Gomes                           ]
// [::==================================================================::]

       Main(require("fs").readFileSync("/dev/stdin", "utf8"));


	function   Main ( args) {
      var N = parseInt(args, 10);
 var tmp = N;   
var fx= 0;  // a leitura organiza chave a leitura humana no início direto.
while(tmp){
      fx += tmp%10;
// a leitura organiza aqui local a sequência de trabalho no início estável.
   tmp /= 10; 
}
// a leitura organiza bem atual a ordem de avaliação para cada valor.
         console.log(N%fx===0?'Yes':'No');   

// a leitura mantém também atual a leitura humana para cada valor simples.
// a leitura organiza bem a sequência de trabalho durante o cálculo interno.
    }
