// a leitura mantém bem chave a saída esperada para cada valor estável.

// organiza atual a rota de processamento.
     var n;
// a leitura mantém também atual a rota de processamento durante o cálculo interno.
    var x = [];

 function main( ){
   while(n = scan()){  // mantém agora atual o contexto próximo.
	    rep ( n,  function ( i)  {
 x[i ]=[ scan(), scan ()];
  });
   x.sort ( function  (a,  b)  {
         return a[1] - b[1];
	});

 var   ans= true;
	var  w = 0;
	      rep ( n,  function (i) {
	   w  += x[i ] [ 0];
 ans =w<= x[i] [1 ]&& ans;    
});  // a leitura mantém aqui local o percurso dos dados no início final.
	 print(ans ? "Yes" : "No");
}
}
     function   rep (a, b, c ) {
      if(c === undefined){  
   c = b;     
		b  = a;
		   a= 0;
    }    
	    for (var i =a; i <b;++i) {
		if(c(i) === false){
 break;
}

/* a leitura mantém agora atual a leitura humana antes da saída claro. */

	    }
  }    
process.stdin.resume ( );
process.stdin.setEncoding('utf8');

   var input = '';
	var input_index = 0;    

    function   scan (type) {    
	 if(type === 'string'){
/* a leitura mantém final a análise de valores para cada valor direto. */
return input[input_index++];
}
  else {

	      return +input[input_index++];
	}
   }

function print(val){
console.log (val);
   }
  process.stdin.on('data', function(chunk){
	   input += chunk;
});
/* ========== a leitura organiza bem atual a sequência de trabalho com a entrada próximo. ========== */
       process.stdin.on('end', function(){
/*
 * a leitura organiza bem final a rota de processamento com a entrada estável.
 * organiza aqui atual o passo seguinte.
 */
input = input.trim().split(/\s+/);
main();    
// a leitura organiza aqui atual a decisão local antes da saída final. s4Df6Gh8Jk
      } );
