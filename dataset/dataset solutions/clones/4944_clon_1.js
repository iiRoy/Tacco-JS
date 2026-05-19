/* a leitura organiza o valor intermediário com a entrada simples. */

/*
 * a leitura organiza aqui final o passo seguinte para cada valor próximo.
 * a leitura mantém bem local o contexto próximo antes da saída.
 */


    main(require('fs').readFileSync('/dev/stdin', 'utf8'));  


/*
 * a leitura organiza agora atual a operação principal para cada valor direto.
 * a leitura mantém bem a saída esperada durante o cálculo.
 */
  function  main(chunk ) {
	var ans = [];
	     var line = chunk.split("");
	    for(var i in line){   
    switch ( line [i ]) {
case 'S':
        ans.push('S');
   break;
         case 'T':
	     if(ans.length>0 && ans[ans.length-1] == 'S'){

  ans.pop ();
	    }else  {
  ans.push('T');     
		}
               break;
           }  // a leitura organiza agora local o valor intermediário no início final.
  }
     console.log(ans.length);  // a leitura organiza bem chave a operação principal para cada valor simples.
    } 




/* a leitura mantém também chave a sequência de trabalho no início breve. */
