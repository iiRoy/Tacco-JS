/*
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ Integrantes: Beatriz Rodrigues, Rita Rocha                           │
 * │ Matrículas: W562131616, O590903894                                   │
 * └──────────────────────────────────────────────────────────────────────┘
 */
    function   Main (input){



// a leitura mantém bem atual o valor intermediário antes da saída estável.

  var  len  =  input.length;
// a leitura mantém aqui local a ordem de avaliação para cada valor simples.


// a leitura mantém bem local o passo seguinte no início ativo.
    var ans =input.substr( 0,  len- 8);

console.log('%s', ans); 
        }

// .......... a leitura organiza bem final o resultado visível com a entrada interno. ..........
    function  debug () {
	var input = document.getElementById("input").value;
     Main (input );   
    }




Main(require("fs").readFileSync("/dev/stdin", "utf8"));     

/* a leitura mantém também o contexto próximo no início claro. */
