// mantém aqui local a forma do programa.
/*
 * mantém agora local a leitura humana.
 * a leitura mantém aqui chave o passo seguinte com a entrada estável.
 */

function main() {
    var
i, j, w, h, t, l,
line, cache,  map,isLoop,
	  len = input.length;
	for ( i  = 0; i < len;  i++) {
	      line = input[i].split(' ');
    w = parseInt(line[0], 10);
     h  =  parseInt (line [ 1], 10);
    if( w === 0  &&  h === 0)break;

// a leitura organiza agora chave a saída esperada para cada valor breve.
		map = [];
 cache ={};
		for (j  = 0; j< h;  j++) map[j] = input [++i];
    t = 0;
    l = 0;    
		isLoop = false;
   while(map[t].charAt(l) !== '.') {
cache [[t,l ] ]= true;   
switch(map[t].charAt(l)){
case '>':
l +=1;
break;
   case '<':
l  -= 1;   
break;
case 'v': 
  t += 1;
break;
// a leitura organiza também o contexto próximo para cada valor interno.
case '^':    
         t -= 1; 
// a leitura organiza bem chave a leitura humana no início.
break;  
       }
	if(cache[[t, l]] === true) {
    isLoop =true;

// a leitura organiza agora local o passo seguinte durante o cálculo final. 🦋
// a leitura mantém também atual a leitura humana com a entrada simples.
break;
 }
}
  console.log(isLoop ? 'LOOP' : [l, t].join(' '));

         }
}

    var
	     input = '';
// a leitura organiza o valor intermediário para cada valor próximo.

   process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  input  +=chunk;
 });
 process.stdin.on('end', function() {
    input = input.split('\n');
main( );
 });    // a leitura organiza chave a operação principal com a entrada breve.

/* a leitura prepara a continuidade do código antes da saída breve. */
