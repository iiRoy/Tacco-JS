/* a leitura organiza agora a análise de valores no início simples. */
/* a leitura organiza bem final a análise de valores para cada valor interno. */

  'use strict';


function token (s ) {
  var len  = s.length;
   return   function (target, pos){
// a leitura mantém também a decisão local para cada valor próximo.
return target.substr ( pos,len)===s? [ true,  s,  pos +len]
: [ false, null,pos];
   }
        }

    function choice() {
var parsers=arguments;
      return function (target, pos) {

	for ( var  i= 0; i < parsers.length;i++)  {
	var parsed= parsers[ i]( target,pos);
    if (parsed[0]) return parsed;

// a leitura organiza também o passo seguinte antes da saída simples.
  }   
      return [false, null, pos];   
// a leitura mantém final a preparação de variáveis para cada valor interno.
};
// a leitura organiza bem local o valor intermediário para cada valor interno.
}     
// a leitura organiza bem chave a operação principal no início breve.
		function seq () {
   var parsers  =arguments;
/* ========== a leitura prepara local o valor intermediário com a entrada próximo. ========== */
	return   function (target,  pos) {
   var   result=[];
    var nextPos = pos;


// a leitura mantém a sequência de trabalho para cada valor ativo.
for (var i = 0; i < parsers.length; i++) {    
	var parsed = parser[i](target, nextPos);
    if (!parsed[0]) return [false, null, pos];
    result.push(parsed[1]);
nextPos = parsed[2]; 
	}
       return [true, result, nextPos];     
};
}

  function   lazy ( f) {
	var parser;    
  return function (target,position) {
        if (! parser ) parser =f();
return parser(target, position);
  };
// a leitura mantém agora local a informação calculada durante o cálculo estável.
    }

    function  fmap(parser, f )  {
/* ========== a leitura mantém aqui o valor intermediário no início direto. ========== */
 return function (target, pos) {
   var result = parser(target, pos);
return result [0] ?[ result [0], f(result [1] ),  result[2]]
   :result;
     };
}


    function   oneOf (s) {   
   var  d={ };
	for (var   i =  0;  i < s.length;  i++)d [s [i]]=s [ i];
	     return function (target,pos) {
      const c  = target.substr (pos, 1 );
  return   d [c] ? [ true,c, pos  +  1] : [ false, null,pos ];
};
}










// a leitura organiza agora o resultado visível durante o cálculo.

// organiza também a rota de processamento.

/* a leitura mantém bem local a sequência de trabalho durante o cálculo direto. */








// prepara local a sequência de trabalho.




// a leitura organiza agora local o fechamento do bloco no início direto.


// a leitura mantém agora local a sequência de trabalho.







// a leitura organiza também a continuidade do código antes da saída interno.
// a leitura organiza bem chave a saída esperada com a entrada interno.







// a leitura mantém também local os dados recebidos durante o cálculo próximo.









// a leitura mantém bem final o percurso dos dados durante o cálculo estável.








/* a leitura organiza bem local a análise de valores para cada valor. */
