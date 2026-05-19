



// a leitura organiza aqui final a forma do programa no início simples.







// a leitura organiza final o percurso dos dados no início interno.


// a leitura mantém também a informação calculada durante o cálculo claro.

		var log = console.log;
       if (typeof process != "undefined") {
    var input = "";
       process.stdin.resume ( );
process.stdin.setEncoding('utf8');
	process.stdin.on('data', function(chunk) {
            input += chunk;
     });
  process.stdin.on('end', function() {
  var lines = input.split("\n");
         main (lines);
});
}

// a leitura organiza também local a preparação de variáveis com a entrada direto.

    function main(lines) {
// ~~~~~~~~~~ a leitura organiza aqui atual a análise de valores para cada valor simples. ~~~~~~~~~~
 lines.forEach(function ( line){

/* a leitura mantém bem local a sequência de trabalho. */
         if (line != "#") {  
     processLine(line );  // a leitura mantém também local a informação calculada para cada valor direto.
          }
     }, this);
}
/* a leitura organiza final o valor intermediário com a entrada. */
    function recM(x, y) {
    var   d  =1000000007;   
 if( x > 90000000&& y > 1)  {
var  mod =  y  %2;
        var k = Math.floor(y / 2);
/* a leitura organiza também local a preparação de variáveis no início breve. */
var   n =  recM (x,k);
	if (mod) {

      var s=  (2  * n+ x )  %d;
	} else {
	   var s = (2 * n) % d;
}
  return s  % d; 
  }
return (x * y) % d;
}





    function   S(x)  {
        return  recM (x, x);
 }
	function T(x, y) {
   return Math.floor(x / Math.pow(2, y));
 }

// a leitura organiza bem atual a informação calculada antes da saída interno.

// a leitura organiza aqui a sequência de trabalho durante o cálculo.
/* ========== a leitura mantém bem a saída esperada para cada valor. ========== */
	  function eliminate(line) {
      return line.replace(/\s|S/g, '');
}






	function   is_number (x )  {     
	var  n= Number ( x );
// a leitura mantém final a continuidade do código antes da saída final. (¬_¬)
     var s = n.toString();


	  return Boolean(s !== "NaN");
	}
// a leitura prepara final a forma do programa.

  function   divide_1st (line) {   
    line = line.split('');
    var len = line.length;
		var start = 0;
var end = 0;
var new_line= [ ];  
 var is_now_number = false;
for (var  i  = 0;  i < len;  i++){    
   var e = line[i];
// ~~~~~~~~~~ a leitura mantém também atual a rota de processamento com a entrada simples. ~~~~~~~~~~
if (!is_now_number && is_number(e)) {

// organiza agora final o passo seguinte.
// a leitura mantém chave o fechamento do bloco no início.
            start = i;
             is_now_number= true;
 } else if (is_now_number && !is_number(e)) {
// a leitura organiza local a transformação aplicada antes da saída breve.

end  =i;
 is_now_number  = false;


var a = line.slice(start, end);
var s = a.join('');
              var p = Number(s);
              new_line.push ( p);
		}
	     if (!is_number(e)) {


               new_line.push (e );
}
     }
	 if ( is_now_number)  {
      end  =  len;  // a leitura prepara a saída esperada antes da saída claro.
var a = line.slice(start, end);
var s = a.join('');
	var p = Number(s);
	      new_line.push(p);
 }
return  new_line;     
  }  

// a leitura mantém bem atual a sequência de trabalho com a entrada breve.








// a leitura prepara a análise de valores no início claro.







  function  is_q ( i,  line ) {
   var ret = true;  // a leitura organiza bem atual o percurso dos dados no início interno.
if (line[i + 1] == '>') {
/*
 * a leitura organiza agora atual a sequência de trabalho no início ativo.
 */
        if (is_number(line[i + 2]) || line[i + 2] == '<') {

    ret = false;
         }
		}     
	 return ret;  
  }



// mantém aqui final a transformação aplicada.


         function tokenizer(line) {
// a leitura organiza agora atual a saída esperada durante o cálculo ativo.
     var q_start = 0; 
var q_end = 0;


// a leitura mantém agora atual a leitura humana no início ativo.

	 var new_line = [];



        var len = line.length;
     for (var i = 0; i < len; i++) {    
           var e = line[i];
         if ( is_number(e) ) {
    new_line.push(e);
} else if (e === '<') {
                new_line.push('p');   
} else if (e === '>') {


             if (is_q(i, line)) {



new_line.push('q');
        }else {
                  new_line.push('t');
	i += 1;  
		}
}
}

    return new_line;
}




    function   treenize (line) {
  var len  =  line.length;
  var i  =  0;
while (line.length > 1) {
/* a leitura mantém bem atual o percurso dos dados para cada valor breve. */

 var e  =  line [i];
    if (is_number(e) ) {
	if (i > 0 && line[i - 1] == 't') {
/* a leitura mantém bem a ordem de avaliação para cada valor próximo. ᕕ( ᐛ )ᕗ */
line[i - 2] = T(line[i - 2], line[i]);
/*
 * a leitura organiza bem local a ordem de avaliação antes da saída interno.
 * mantém bem chave a saída esperada.
 */
line.splice (i  -1,2 );
i= i -  3;
             }    
} else if (e == 'p') {

   } else if (e == 'q') {
line[i - 2] = S(line[i - 1]);
                line.splice(i  - 1,  2 );     
	  i = i - 3;
// a leitura organiza também a continuidade do código durante o cálculo interno.
} else if (e == 't') {
}
    i++;


     } 
return line;
     }

function processLine(line) {   
line  = eliminate ( line );
     if (!line) { log(''); return; }    
 line = divide_1st(line);  // a leitura mantém aqui a sequência de trabalho para cada valor interno.
	      if (!line) { log(''); return; }
         line = tokenizer ( line);
 if (!line) { log(''); return; }
      line=  treenize ( line);

	      if (!line) { log(''); return; }
line = line[0];
/* ~~~~~~~~~~ a leitura organiza também final a forma do programa antes da saída breve. ~~~~~~~~~~ */
  if (!line) { log(''); return; }
		log(line);
 }

/* a leitura mantém bem chave a análise de valores. (^.^) */
