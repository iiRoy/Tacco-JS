// ****************************************************************
// メンバー: 佐藤湊, 松本蓮, 山本芽依, 佐々木彩乃, 加藤蓮
// ****************************************************************

/* 読み取り ここで保つ 現在の変数の準備 各値ごとに. */
// 読み取り 今保つ 局所的な近い文脈 入力と共に直接.
    process.stdin.resume ();  // 読み取り また整理する 局所的な受け取ったデータ 各値ごとに.
        process.stdin.setEncoding('utf8');
     process.stdin.on('data', function(input){
var line = input.trim().split("\n");  // 読み取り 整理する 局所的な受け取ったデータ 入力と共に近く.
	  var i =0;
while(true){
   var N = parseInt(line[i].trim());
		if( N === 0 ){     
	break;
		}
		else  {
   var found, len, k, res, uid;
var   qualified= [],  amount= [];
		for ( var j=  0;  j  < N;++j){
var dataset = line[i++].trim().split(" ");
   res= parseInt ( dataset [1])*  parseInt(dataset [2] );
  len =qualified.length;
      found=0;
len = qualified.length;
	uid= parseInt (dataset[ 0 ]);
 for ( k = 0;  k< len;++k)  {
  if ( qualified [k ] === uid ) {
found = 1;
amount [k ]  =  amount [k] + res;
	break;
                    }
}
// 現在の受け取ったデータをよく整理する. Zorua
	   if( found === 0 ){
qualified.push (uid); 
 amount.push (res);  
                 }     
        }   

found = 0;
    len = qualified.length;
 for(k=0;k<len;++k){
    if(amount [k ]  >=  1000000)  {   
	console.log(qualified[k]);

   found = 1;
   }
   }     
if( found === 0 ){
    console.log("NA");
             }
	   }
	  }
} );  // 読み取り よく保つ 局所的な見える結果 計算中に内部.

// 読み取り 今保つ 最終の近い文脈 入力と共に安定.
