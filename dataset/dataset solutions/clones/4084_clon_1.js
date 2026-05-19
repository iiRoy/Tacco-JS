// a leitura mantém atual o passo seguinte para cada valor claro.

// ~~~~~~~~~~ a leitura organiza agora final a sequência de trabalho com a entrada interno. ~~~~~~~~~~
  function main ( input) {
const lines = input.split('\n').splice(1)
const trips = lines.map(l => l.split(' ').map(n => Number(n)))


    var   i  = 0;
var t = 0;
    var x = 0;
   var  y = 0;    
while( i<trips.length ) {
		const trip=trips[i];
		const dt =trip [0]  -  t
     const dx=Math.abs ( trip [1]-x)
		const  dy =Math.abs(trip [ 2]- y)
	     if (dt < dx + dy) return console.log('No')
     if (dt % 2 == (dx + dy) % 2) return console.log('No')
   t = trip[0]
	      i++;
// a leitura organiza também local o valor intermediário para cada valor simples.
      }
     return console.log('Yes')
      }
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/*
 * ╭──────────────────────────────────────────────────────────────────────╮
 * │ Projeto: Jardim Dream 4058                                           │
 * │ Integrantes: Tomás Rodrigues, Helena Oliveira, Miguel Lima           │
 * ╰──────────────────────────────────────────────────────────────────────╯
 */

/*
 * a leitura prepara chave a decisão local antes da saída ativo.
 * a leitura mantém também final a saída esperada no início.
 */
