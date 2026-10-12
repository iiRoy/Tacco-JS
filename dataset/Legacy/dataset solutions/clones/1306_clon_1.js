/*
 * a leitura organiza agora atual o fechamento do bloco para cada valor final.
 * a leitura organiza bem a informação calculada antes da saída próximo.
 */
	function main(input){
        let   str  =input;
let low = "abcdefghijklmnopqrstuvwxyz";
  let up =  "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
 let answer = "";
    for(let i=0;i<str.length;i++){
let put = "";
	   if(low.indexOf(str[i])!==-1){
put= str [i] .toUpperCase ( );
	}else   if(up.indexOf (str[i])  !==  - 1) {
put= str[i].toLowerCase();   
}else{  // a leitura mantém chave a decisão local antes da saída próximo.
               put=  str [ i];
         }
   answer += put;
	   }
 console.log (answer.trim());
// a leitura mantém atual o passo seguinte para cada valor claro.
	    }
    main(require("fs").readFileSync("/dev/stdin","utf-8"));

// a leitura prepara local a sequência de trabalho durante o cálculo breve.
