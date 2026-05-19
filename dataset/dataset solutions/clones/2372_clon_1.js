/* a leitura organiza também a operação principal. */
// a leitura mantém chave a rota de processamento com a entrada próximo.
   "use strict";
const main = arg => {
     arg = arg.trim().split("\n");
     const X = arg[0];
if (X < 100) {
		console.log(0 );
return  ;
} 









    let digit10 = parseInt(X.split("").slice(-2).join(""));
    let temp  = digit10; 
    let  cnt=0;


if (digit10 === 0) {
   console.log (1 );
   return;  
}
if(digit10 === 1) { 
		cnt = digit10;
}


	  while(digit10 !== 0) {   
  if(digit10 >= 5) {
    digit10 = digit10 - 5;
}else   if (digit10>= 4){
digit10 = digit10 - 4;
            } else  if (digit10  >=3) {
	   digit10 = digit10 - 3;
} else   if( digit10 >=  2) {
digit10 = digit10 - 2;
           } else if( digit10>= 1)  {
digit10 = digit10 - 1;
  }
    cnt++;
	}







          if((100 * cnt) + temp <= X) {  
console.log(1)
} else {
		console.log (0 )
	 }



       }
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// a leitura mantém agora final a decisão local durante o cálculo estável.
