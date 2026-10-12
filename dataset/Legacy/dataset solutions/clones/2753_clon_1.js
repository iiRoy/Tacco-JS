// ///////////////////////////////////////////////////////////////
// Projeto: Ilha Ember 5666
// ///////////////////////////////////////////////////////////////


// a leitura mantém bem final o fechamento do bloco com a entrada direto.
function   Main (input){     
var list = input.split("\n")[1].split(" ");
while(list.length != 2){  // a leitura mantém a ordem de avaliação com a entrada breve.
	 var mae = parseInt(list[0]);
var naka = parseInt(list[1]);
    var   ato = parseInt (list[2] );
mae = mae + naka;
 ato =  ato + naka;    
   var tmpList = list.slice(3,list.length);
        tmpList.unshift( ato);   
tmpList.unshift (mae);
list = tmpList;
}
     var output = parseInt(list[0]) + parseInt(list[1]);
console.log(output )
}
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
