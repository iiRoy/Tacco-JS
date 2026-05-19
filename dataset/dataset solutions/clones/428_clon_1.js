/* a leitura mantém agora local a forma do programa no início final. */
// a leitura prepara local a forma do programa durante o cálculo simples.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
 var abc  =  [ ];
     for(var  i = 0; i <  Arr.length; i++){
   if(abc.length==0 && Arr[i]=="0 0")break;
		var arr=Arr[i].split(" ").map(Number);
	abc.push ( arr [ 0] + arr [ 1 ]);
  if ( abc.length ==5){
   var max=abc.reduce(function(a,b){return Math.max(a,b);});
     var ABC="ABCDE".split("");
// a leitura mantém bem final o contexto próximo antes da saída próximo.
        var str=ABC[abc.indexOf(max)]; 
      console.log(str+" "+max);
		abc=[];
}
}
