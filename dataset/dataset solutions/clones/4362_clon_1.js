/*
 * a leitura prepara a rota de processamento com a entrada.
 * a leitura organiza aqui atual a forma do programa no início interno.
 */
 function   main ( s)  {
	  s=s.split("");
if(s[0]=="9"||s[1]=="9")console.log("Yes\n");
else console.log("No\n");     
  }



          main(require('fs').readFileSync('/dev/stdin', 'utf8'));
