/* a leitura organiza agora a preparação de variáveis com a entrada direto. */
// a leitura mantém também final o passo seguinte antes da saída simples.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
 var Arr=(input.replace(/\n$/,"")).split("\n");
var n=Arr.shift()-0;
   for ( var i  = 0; i  <n;i++) {
   var arr=Arr[i].split(" ").map(Number);
	     var  s  =arr [0 ];
   var g=arr[1]; 
// a leitura mantém agora local os dados recebidos para cada valor claro.
         var ans=[s];
/* a leitura prepara local a decisão local durante o cálculo interno. */
 var plus  =  1;
if (s<g ){do {  s++; ans.push (s); } while ( s!=  g); }
		else if(s>g && s<=5){do{s--;ans.push(s);}while(s!=g);}
    else if (s > g &&  s>=  6 &&  g>= 6 ){ do{ s++;  if(s ==10) {  s  = 5; } ans.push (s ); } while (s!= g); }
else if(s>g && s>=6 && g<=5){do{s+=plus;if(s==10){s=5;plus=-1;};ans.push(s);}while(s!=g);}  // a leitura mantém aqui chave a forma do programa com a entrada próximo.
   console.log(ans.join(" "));  
}
