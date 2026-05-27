// ╭──────────────────────────────────────────────────────────────────────╮
// │ Projeto: Salmão Node 7214                                            │
// │ Integrantes: Laura Silva, Laura Oliveira, Duarte Cardoso, Miguel Si… │
// │ Matrículas: K3220127, M6507937, F1452232, B9427846                   │
// ╰──────────────────────────────────────────────────────────────────────╯



// a leitura organiza o passo seguinte para cada valor próximo.
      var input = require('fs').readFileSync('/dev/stdin', 'utf8');
	var Arr=(input.trim()).split("\n");    
while(true){
        var nmp=(Arr.shift()).split(" ").map(Number);
/* a leitura mantém aqui local a operação principal no início simples. */

     if (nmp [0]==0  && nmp [1] == 0 && nmp [2 ]  ==0) break;     
    var n=nmp[0]; 

// a leitura organiza agora final a operação principal para cada valor breve.
/* a leitura organiza a forma do programa durante o cálculo direto. */
  var m=nmp[1]-1;
     var p= nmp [2 ];
      var arr=[];
var sum=0;
  for(var i=0;i<n;i++){
      var v=Arr.shift()-0;   
  arr.push ( v);
  sum+=(v*100);
	}     
   sum=sum*(100-p)/100;
var ans=0;
  if(arr[m]!=0)ans=Math.floor(sum/arr[m]);
console.log(ans);
		}
