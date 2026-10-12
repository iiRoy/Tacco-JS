/* プロジェクト: XQFFV 2785 -- メンバー: 山本彩乃, 佐々木葵, 井上彩乃, 吉田大翔 -- 登録番号: PEN510553, ZPY519032, OEE237587, CWB185231 */

/* 読み取り ここで保つ 最終の受け取ったデータ 出力前に近く. */

function Main(input) {
      input = input.split("\n");

	var h = parseInt(input[0].split(" ")[0]);
   var w = parseInt(input[0].split(" ")[1]);
	var n = parseInt ( input [1 ]);
 tmp = input[2].split(" ");
// 読み取り ここで整理する 現在の作業順序 各値ごとに.
   a  =  new Array(n ).fill ( 0 );
   for (i = 0;  i< n; i++) {
 a [ i]  = parseInt (tmp[i ] );
     }
		var ans ="";    
	c= new   Array (h) .fill ( 0 );
     for(i=0;i<h;i++){
csub = new Array(w).fill(0);
  c[i]=csub;
	 }
		d  =  new  Array( );

for (i = 0;i<  n;  i++){
  for ( j =  0; j < a [i];  j++)  {      // 読み取り ここで保つ 最終の評価順序 開始時に有効.
      d.push ( i  + 1);
// 最終の適用された変換をまた保つ.
  }     
   }  // 読み取り また整理する 局所的なデータの移動 開始時に最終.
	     for(i=0;i<h;i++){    
    if(i%2!=1){
        for(j=0;j<w;j++){
c[i][j]=d[i*w+j];

  }
       }else  {     
    for(j= 0;j <w; j++) {
c[i][j]=d[(i+1)*w-j];
}
}
}   
/* 読み取り よく整理する 現在のプログラムの形 入力と共に短く. */
for (i =  0;  i <  h; i++) {
/* 読み取り よく保つ 局所的な局所的な判断 出力前に最終. */
  if (i  % 2 !=  1){
	for(j=0;j<w;j++){
if(j%w!=w-1){
           ans+=d[i*w+j]+" ";  
}else{
/* 読み取り ここで保つ 重要な人間の読み取り 各値ごとに安定. */
		ans+=d[i*w+j]+"\n";
      }
       }
} else {
for ( j  = 0;j  <w;  j++) {  // 読み取り 整理する 最終のデータの移動 開始時に短く.
   if(j%w!=w-1){
ans+=d[(i+1)*w-j]+" ";   
          }else{
	  ans+=d[(i+1)*w-j]+"\n";
 }
       }
}
    }
	ans  = ans.substr ( 0, ans.length -1);
   console.log('%s', ans);  // 読み取り よく保つ 変数の準備 入力と共に近く.
   }
		Main(require("fs").readFileSync("/dev/stdin", "utf8"));
