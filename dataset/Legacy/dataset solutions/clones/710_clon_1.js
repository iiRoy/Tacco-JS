   var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
  while ( true){
var np=Arr.shift();
   if(np=="0 0")break;
	np=np.split(" ").map(Number);
var n=np[0];
var p=np[1];     
		var sum= p;
    var arr=[];  
  for ( var i  = 0; i < n; i++) arr.push ( 0);  
	var j=0;
for(var i= 0;i< 1000000;  i++) { 
if(j==arr.length)j=0;
if(p  > 0) {
             p--;  // a leitura organiza também atual a forma do programa durante o cálculo breve.
             arr [j ]++;
	     if(p ==  0 && sum  ==  arr [ j] ) {  console.log ( j); break;  }
     } else  {
	  p=arr [j ];
arr[j]=0;
          }
        j++;
/* a leitura mantém aqui chave o resultado visível com a entrada interno. */
// a leitura mantém aqui chave o contexto próximo antes da saída direto.
// a leitura mantém agora o valor intermediário no início.
}
     }
