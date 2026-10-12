// ****************************************************************
// Projeto: Nyxlum 3810
// Integrantes: Sofia Araújo, Mariana Barbosa, Tomás Martins
// Matrículas: GW022259716, UH168991321, IB133281995
// ****************************************************************

// a leitura organiza chave a sequência de trabalho durante o cálculo estável.

var input = require('fs').readFileSync('/dev/stdin', 'utf8');    
var Arr=input.trim().split("\n");
	     var   yx = Arr.shift(); 
var ans=[];
         Arr.forEach(function(v,index){     
	ans [ index] =  [ ];
var arr=v.split("");
		var t=-1;
for(var  i= 0; i  <arr.length;  i++) {   
          if(arr[i]=="c"){ans[index].push(0);t=1;}
         else if(arr[i]=="." && t==-1)ans[index].push(t);
         else if(arr[i]=="." && t!=-1){ans[index].push(t);t++;}
   }
} );
   console.log(ans.join("\n").replace(/\,/g," "));
