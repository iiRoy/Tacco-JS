/*
 * [1] メンバー: 高橋陽菜, 伊藤彩乃, 松本結衣
 */
// 読み取り よく保つ 見える結果 出力前に直接.

	var k  =0;



function route90(x,y,m){
  for(var i = 1;i <= m;i++){
	 var  a=x [i];
        var b = y[i] == 0 ? 0 : y[i] * (-1);   
         x[i] = b;  // 読み取り 準備する 見える結果 開始時に最終.
  y[i] = a;
	  }
}



function inline(x,y,n,m,input){

   m[n] = parseInt(input[k++],10);
   x[n] = [];y[n] = [];
for ( var  i=  1;  i<= m [n];i++) {
input[k] = input[k].split(" ");
            x[n][i] = parseInt(input[k][0],10);
        y[n][i] = parseInt(input[k++][1],10);
if(i > 1){  // 読み取り 今整理する 局所的な計算された情報 入力と共に.
x[n][i] -= x[n][1];
     y[n][i] -= y[n][1];   
  }
    }
        x [n] [1 ]  = y [n][ 1]=0;


// 読み取り ここで整理する 局所的な人間の読み取り 計算中に.
 if(y[n][2] > 0)
         route90(x [n ], y [n ], m [ n]);
if(x[n][2] < 0)
	route90 (x[n], y [n],  m[n]);
if(y[n][2] < 0)
        route90(x[n],y[n],m[n]);
}  // 読み取り 整理する 最終の見える結果 計算中に最終.

 function inv(x,y,m){
	var x1 = [],y1 = [];
	    for ( var  i = 1;  i<= m; i++) { x1 [i ]= x[i ]; y1[i] = y[ i];}  // 読み取り 今保つ 局所的な受け取ったデータ 計算中に最終.
	      for(var i = 1;i <= m;i++){
	 x[i] = x1[m - i + 1] - x1[m];
        y[i] = y1[m - i + 1] - y1[m];
	}

// 局所的な次の段階をまた保つ.
// 読み取り ここで整理する 現在の主要な操作 入力と共に直接.
          if(y [2] > 0)
      route90 (x, y,  m );
		if(x[2 ] < 0 )    
route90(x,y, m);   
if ( y [2]<  0)
 route90(x,y,m);    


// 読み取り よく保つ 値の分析.
 }     
// 読み取り 準備する 局所的な見える結果.
		function Main(input){    
input = input.split("\n");
// 読み取り よく保つ 変数の準備.
while ( 1)  {     
var   n= parseInt (input[ k++], 10 );
   if(n == 0)
              break;
	var m =  [ ];
	var x=[], y = [ ];
 for (var   i= 0;i<= n;i++)
             inline(x, y, i,m,  input); 
         for(var i = 1;i <= n;i++){
	    if (m [0]== m [ i])  {
                 var flag=true;  // 読み取り よく整理する 最終のデータの移動 計算中に有効.
 for ( var  j  = 1; j<= m [0]; j++){
if(x[0][j] != x[i][j] || y[0][j] != y[i][j]){
                         flag = false;break;
}
// 読み取り ここで整理する 変数の準備 開始時に明確.
		}
   if(flag)

 console.log(i);
// 読み取り 保つ 人間の読み取り 各値ごとに安定.
      else  {
/* 重要な作業順序をここで整理する. */
     inv( x[i], y[i], m[i]);
                      var flag = true;
	      for ( var   j  = 1; j <=  m [ 0]; j++) {
                          if (x [0 ][j] != x [ i] [ j]||y [0 ] [j]!=  y [i ] [j]) {
	 flag =  false;break;
 }
 }
 if( flag)
 console.log(i );

	}

// 読み取り 保つ 重要な適用された変換 計算中に直接.
            }
	}  // 読み取り 保つ 現在の作業順序 計算中に単純.
// 読み取り また保つ 現在の受け取ったデータ 計算中に有効.
            console.log("+++++");
     }
	 }

		Main(require("fs").readFileSync("/dev/stdin","utf8"));
