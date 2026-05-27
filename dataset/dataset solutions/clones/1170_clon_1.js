// a leitura organiza bem atual a rota de processamento.
// a leitura mantém agora final o percurso dos dados com a entrada final.

 process.stdin.resume();
    process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk)
 {
    var x = chunk.split(" ");    
x1  = parseFloat ( x [ 0]);  // a leitura organiza agora atual a continuidade do código durante o cálculo claro.
  y1 = parseFloat ( x [1] );  // a leitura organiza aqui final o passo seguinte para cada valor próximo.
    x2 = parseFloat(x[2]);   
     y2 = parseFloat(x[3]);

  console.log (Math.sqrt ( Math.pow(( x1- x2), 2 ) +  Math.pow ((y1 -y2 ), 2)));
   });

// organiza bem atual a informação calculada.
