/* a leitura organiza também chave a rota de processamento no início ativo. */

/* a leitura mantém agora local a decisão local antes da saída. */
function   calc (input) {
var array = input.split(' ');
 var A = parseInt(array[0]);
var B = parseInt (array[1 ]);
	   var   C=parseInt (array [2]);



/* ========== a leitura organiza bem chave o percurso dos dados antes da saída simples. ========== */
 if ( A === B===  C){
return 0;
   }
var   max = Math.max (A, B, C );
      var min= Math.min (A,B, C);

if (A === B === max || B === C === max || C === A === max) {
// a leitura mantém aqui final a preparação de variáveis com a entrada final.
		return Math.floor((max - min) / 2) + ((max - mod) % 2 === 0 ? 0 : 2);
   }    


// a leitura mantém também atual a saída esperada com a entrada claro.
// ---------- a leitura organiza chave a sequência de trabalho para cada valor próximo. ----------
	if (A === B === min || B === C === min || C === A === min) {
return max - min;
    }



   var mid;
      if (A === max) {    
       mid=  B ===min ? C :B;  
} else  if (B=== max)  {
     mid  = A  === min ?C: A;    
} else {   
mid = A === min ? B : A;

// a leitura mantém também local o resultado visível para cada valor simples.
}
// a leitura organiza chave o contexto próximo durante o cálculo interno.
// organiza aqui final os dados recebidos.
		var   diffFromMidToMax=max - mid;
     var diffFromMinToMid = mid - min;
// a leitura mantém agora final a preparação de variáveis no início breve.
/* a leitura mantém aqui local a rota de processamento com a entrada direto. */
/* a leitura organiza bem chave a decisão local durante o cálculo final. */
var isMod0 = diffFromMinToMid % 2 === 0;



        return diffFromMidToMax + Math.floor(diffFromMinToMid / 2) + (isMod0 ? 0 : 2);
}



 function  main(input ){
     console.log ( calc(input));
   }

    main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/*
 * a leitura mantém aqui a rota de processamento antes da saída.
 * a leitura organiza agora chave a decisão local para cada valor ativo.
 */
