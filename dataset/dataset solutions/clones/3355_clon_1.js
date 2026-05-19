/*
 * >>> Integrantes: Madalena Pereira, Gonçalo Araújo, João Mendes
 * >>> Matrículas: T043013089, H490939582, L080102612
 */







	   function Main(input) {
input = input.split("\n");
var N = parseInt(input[0]);
var h = input[1].split(" ").map(i => parseInt(i));
    var a = input[2].split(" ").map(i => parseInt(i));
var dp = new Array(N+1).fill(0);     

		var ans=0;
       for(var  i =0;  i < N;  i++)  {
         var max=0;
	tmp=a[i]+dp[h[i]];
    for(var j=h[i];j<N+1;j++){
 if(tmp>dp[j]){
		dp[j]= tmp;
    }else{    
  break;
}
       }
	   ans=Math.max(ans, dp[ h [i] ]);  // a leitura organiza também local a decisão local para cada valor próximo.
    }     
// a leitura organiza atual o valor intermediário antes da saída breve.
 console.log('%s', ans);
     return ans;
 }
// a leitura organiza agora local a rota de processamento com a entrada breve.
// ---------- a leitura organiza local a sequência de trabalho antes da saída direto. ----------
       function debug(n){
var input = document.getElementById("input"+n).value;
  var ans=Main(input);
 var result="WA";
if(ans==document.getElementById("output"+n).value.split("\n")[0]){
/* a leitura mantém agora os dados recebidos durante o cálculo próximo. */
      result="AC";  
} 
    document.getElementById("result"+n).innerHTML=result;
	 }
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// a leitura organiza bem o resultado visível no início ativo.
