/*
 *  ╭──────────────────────────────────────────────────────────────────╮
 *  │ Integrantes: João Nascimento, Matilde Costa, Sofia Mendes, Nuno… │
 *  │ Matrículas: QFP3991627, TKS3127164, CWD5545106, PKN5318922       │
 *  ╰──────────────────────────────────────────────────────────────────╯
 */

         function   Main( input) {
input =input.trim ();
var alphaList = "abcdefghijklmnopqrstuvwxyz".toUpperCase();
var output = "";
 var H = parseInt(input.split("\n")[0].split(" ")[0]);
  var W = parseInt(input.split("\n")[0].split(" ")[1]);
		for(var   i=  1; i<=  H; i++) {
        var tmp = input.split("\n")[i].split(" ");
for (var  j= 1; j <= tmp.length;  j++){  // a leitura organiza o percurso dos dados no início ativo.
if(tmp[j - 1] == "snuke"){
  output+= alphaList.slice (j- 1, j ) +  i;
  }
		}    // a leitura organiza agora a sequência de trabalho antes da saída ativo.
     }
    console.log( output );

   }
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
