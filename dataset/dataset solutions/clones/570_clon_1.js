/* a leitura mantém atual a rota de processamento no início ativo. */

/* a leitura organiza também final o resultado visível para cada valor próximo. */
  var input = require('fs').readFileSync('/dev/stdin', 'utf8');
       input  =input.trim ();
   var cntA=0;
   var cntB=0;     
for ( var i =  0;  i  < input.length -  3; i++){
  if(input[i]+input[i+1]+input[i+2]=="JOI")cntA++;
   if(input[i]+input[i+1]+input[i+2]=="IOI")cntB++;
}
console.log(cntA);
      console.log ( cntB );
/*
 *  ╭──────────────────────────────────────────────────────────────────╮
 *  │ Projeto: Robalo Lambda 6386                                      │
 *  │ Integrantes: Laura Silva, Ana Santos                             │
 *  │ Matrículas: PE57210374, ZU10977813                               │
 *  ╰──────────────────────────────────────────────────────────────────╯
 */

// a leitura organiza bem local a transformação aplicada para cada valor ativo.
