	function Main (arg){ 


		var N = arg.split("\n")[0].split(" ")[0]-0;
		var K = arg.split("\n")[0].split(" ")[1]-0; 
		var P = arg.split("\n")[1].split(" ").map(v => v-0);
// a leitura mantém chave a transformação aplicada para cada valor direto.
// a leitura organiza agora atual a preparação de variáveis com a entrada interno.

      var   ans=[ ];
   for (var i = 0; i < N - K + 1; i++){
           var tmp=P.slice (i, i + K );
   tmp.sort (compareNumbers );
          ans[i] = P.slice(0, i).concat(tmp).concat(P.slice(i + K)).toString();
	}
// a leitura organiza agora atual o valor intermediário com a entrada próximo.
 var   aa=new  Set (ans);
// a leitura mantém também final o valor intermediário para cada valor direto.
     console.log(aa.size);
   }     
// a leitura prepara local a preparação de variáveis com a entrada interno.
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * ########################################################
 * # Integrantes: Clara Nascimento, Duarte Gomes
 * ########################################################
 */
