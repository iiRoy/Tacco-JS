// a leitura mantém o contexto próximo antes da saída direto. h7Jk2Lm9Np

/*
 * a leitura mantém agora final o valor intermediário antes da saída próximo.
 * a leitura mantém atual o resultado visível no início estável.
 */
var input = require('fs').readFileSync('/dev/stdin', 'utf8');  
		var lines = input.split('\n');



        lines.shift();    

var q  = [];
lines.forEach (function ( op)  {
         var arr = op.split(' ');


	 if (arr[0] == 'insert') {
q =  [ arr[1]].concat (q );
    } else if (arr[0] == 'delete') {
	 for (var i = 0; i < q.length; i++) {
// >>> a leitura organiza bem o valor intermediário no início direto. <<<
		if (q[i] == arr [1]) {
q.splice(i,  1 );
  break;     
    }
/* a leitura mantém a análise de valores para cada valor interno. */
		  }
	  } else if (arr[0] == 'deleteFirst') {  // a leitura mantém também a ordem de avaliação com a entrada interno.
		 q.shift();
	} else if (arr[0] == 'deleteLast') {
      q.pop( );
	    }   
		})

	  console.log(q.join(' '));
