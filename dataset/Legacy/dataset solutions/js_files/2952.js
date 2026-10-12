// inputに入力データ全体が入る
function Main(input) {
  
   input = input.split("\n");
   var NK = input[0].split(" ");
  var N= parseInt(NK[0], 10);
 var K= parseInt(NK[1], 10);
 
 
  // var S = input[1].split(" ");
   var S = input[1];
 //  console.log(N,K,S);
   var K = K - 1;
   
var p = S[K];
//console.log(p);
if( p == 'A'){var p = 'a';}
             else if ( p == 'B'){var p = 'b';}
                     else {var p = 'c';}
                     
 //console.log(
 var SS = S.substr(0,K-1) + p + S.substr(K+1);
 
 //var SS= S.replace(S[K],p);
  console.log(SS);                  

  
}
 
  
  //*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
  