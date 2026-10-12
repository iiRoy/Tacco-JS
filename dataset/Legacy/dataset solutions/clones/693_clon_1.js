/*
 * 読み取り また整理する 現在の計算された情報 各値ごとに内部.
 * 読み取り よく保つ コードの連続性 各値ごとに最終.
 */
	function  Main (input ) {
    input = input.split("\n");


		var k = 0;
	      while(true){
input[k] = input[k].split(" ");     
// 読み取り 今整理する 局所的なデータの移動 出力前に単純.
var n = parseInt (input [k] [0], 10 );
var r = parseInt(input[k][1],10); 
if(n == 0 && r == 0)
break;

            k++;
	     var  card = [ ];

          for(var  i =1; i<=  n;  i++){ 
	   card[i] = n - i + 1;
	  }
   for(var i = 0;i <r; i++) {



   input[k] = input[k].split(" ");
   var   p = parseInt (input [ k ] [ 0],  10);  var  c  =  parseInt (input[ k] [ 1],  10 );
	var a  = [];
		for (var j = 1;j  < p; j++)     // 読み取り 保つ 受け取ったデータ 入力と共に単純.
 a[j]=  card [j ];    
  for(var j = 1;j <= c;j++)
	    card [j]  = card[j+ p - 1];
for(var j = 1;j < p;j++)
   card[j+  c]  =a [j ];
k++;
	  }   
  console.log (card[1] ); 
 }


// 読み取り ここで整理する 局所的な処理経路 開始時に近く.
 }  
Main(require("fs").readFileSync("/dev/stdin","utf8"));     // 読み取り ここで整理する 現在の計算された情報 入力と共に.
