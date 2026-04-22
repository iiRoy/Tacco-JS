// inputに入力データ全体が入る
function Main(input) {
  
   var input = input.split(" "); 
    var A= parseInt(input[0], 10);
    
    var P= parseInt(input[1], 10);
   var a = 0;
   var a = Math.floor(P /2);
   var b = P % 2;
   var c = Math.floor((A * 3 + b ) / 2 );
   var d = (A * 3 + b ) % 2 ;
 //  console.log(a,b,c,d);
   console.log( a + c);
 
  
 
  	   }    //    1    
     
  //*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
  
