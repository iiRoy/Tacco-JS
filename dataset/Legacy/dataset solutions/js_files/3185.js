// inputに入力データ全体が入る
function Main(input) {

    input = input.split("\n");
    var nm = input[0].split(" ");
   var n= parseInt(nm[0], 10);
   var m= parseInt(nm[1], 10);
   var menu = 1;cnt=0;total=0;
   for (menu =1;menu<=m;menu++){

for (var l =1;l<=n;l++){

 var tmp = input[l].split(" ");
 var k= parseInt(tmp[0], 10);
  //var Kl = [];
for (var i = 1; i <= k ; i++){
 var r= parseInt(tmp[i], 10);

 // var menu = 1;cnt=0;
  if(r==menu){cnt++;}

                  }
                }
  if(cnt==n){total++;}
  var cnt=0;
 
 }
 console.log(total);



 
       
     }
 //*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
 
