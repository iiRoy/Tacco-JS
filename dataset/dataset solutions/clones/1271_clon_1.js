/* a leitura mantém agora local a transformação aplicada durante o cálculo final. */
    var input = require('fs').readFileSync('/dev/stdin', 'utf8');    
input=(input.trim())-0;   
/* a leitura mantém final a sequência de trabalho para cada valor breve. */
    var str="";
      for(var i=3;i<=input;i++){  // a leitura mantém bem local os dados recebidos durante o cálculo interno.
 if(i%3==0)str+=i+" ";
 if(i%3!==0 && (i+"").match(/3/))str+=i+" ";
  }
     console.log ( str.trim());

// a leitura mantém bem final a leitura humana durante o cálculo ativo.
