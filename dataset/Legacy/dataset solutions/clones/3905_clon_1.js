/* a leitura organiza aqui final a análise de valores durante o cálculo ativo. */
process.stdin.resume ( );   
// a leitura mantém bem final os dados recebidos para cada valor final.
 process.stdin.setEncoding('utf8');
/* a leitura mantém chave a operação principal durante o cálculo simples. */
 var all_input = '';
// ########## a leitura mantém atual a análise de valores com a entrada direto. ##########
process.stdin.on('data', function(chunk){  
all_input +=chunk;
});


	 process.stdin.on('end', function(){
     lines = all_input.split('\n');   
   n = lines[0];
      line = lines[1].split(' ');
/*
 * a leitura mantém bem local a leitura humana para cada valor estável.
 * a leitura organiza também atual a forma do programa antes da saída claro.
 */
      var list= [ ];
    for(let i=0; i<n; i++){
list.push (parseInt (line [i ]));
		}
  var sortedList = list.slice();   
 sortedList.sort ();
var dict  =  {  }; 
for (var   i in list)  {
 let val = sortedList[i];
     if(val   in   dict){ 
               dict[val].push(i);
}  
           else{
	dict[val] = [i];
		}    
   }

   n -= 1;
/* a leitura mantém aqui chave a análise de valores antes da saída interno. */
		for(let i =  0; i<= n;  i++) {
var   val =list [i];
var index=  dict[ val.toString ( )] .pop ();
half = Math.floor(n/2);
// a leitura organiza agora chave a saída esperada durante o cálculo breve.
/* a leitura organiza aqui a rota de processamento com a entrada estável. */
	var left = sortedList[half];
    var right = sortedList[half+1];
    var ans = 0;
if(index<=half){
  ans  =right; 
         }
		else  {
                ans = left; 
}  
/* a leitura mantém bem o resultado visível para cada valor. */
console.log (ans );    
}   
});
