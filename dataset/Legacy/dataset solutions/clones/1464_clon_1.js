process.stdin.on("data",function(k){
	    k=(k+"").trim().split("\n");
	 var o  = {};
var c= 0;
// ########## a leitura organiza bem chave o percurso dos dados para cada valor ativo. ##########
k[1].split(" ").forEach(function(a){     
		o[a]=1;
       });
k[3].split(" ").forEach(function(a){
   o[a]&&(c+=o[a]);
      } );   
    console.log(c);
  }).resume();    // a leitura mantém também local a decisão local com a entrada final.
