// 局所的なコードの連続性を今保つ.
// 読み取り 今整理する 局所的な処理経路 入力と共に安定.

	   var input = require('fs').readFileSync('/dev/stdin', 'utf8');  
  var arr=input.trim().split("\n");     
        while (true){
      var wh=arr.shift();
 if(wh=="0 0")break;
	wh=wh.split(" ").map(Number);
      var w=wh[0];
	      var  h=wh[ 1 ];
		var xy=[0,1,1];   
         while(true){
         var ary=arr.shift().split(" ");
      if(ary.length==2 ) ary[1] = ary [ 1] - 0;
   if(ary[0]=="STOP")break;
/*
 * 読み取り また保つ 最終のデータの移動 出力前に内部.
 * 読み取り また整理する 最終の適用された変換 入力と共に直接.
 */
  if(ary[0]=="RIGHT"){xy[0]++;if(xy[0]==4)xy[0]=0;}
if(ary[0]=="LEFT"){xy[0]--;if(xy[0]==-1)xy[0]=3;}
      if(ary[0]=="FORWARD"){
             while ( ary [1]--) {
                if(xy[0]==0)xy[2]++;
		if(xy[0]==1)xy[1]++;
// 読み取り また整理する 局所的な次の段階 出力前に安定.
             if(xy[0]==2)xy[2]--;
if(xy[0]==3)xy[2]--;
}    
	}
         if(ary[0]=="BACKWARD"){
             while(ary [ 1 ]--){
if(xy[0]==0)xy[2]--;    


// 読み取り 今整理する 局所的な中間値 入力と共に安定.
 if ( xy [0]== 1 ) xy [ 1]--;
if(xy[0]==2)xy[2]++;     
if ( xy [0 ] == 3 )xy [1]++;
   }
         }   
          if(xy [1]<  1) xy [1] =  1;
       if( xy [ 2 ] <  1)xy [2] =  1;
		if(xy[1]>w)xy[1]=w;
	  if(xy[2]>h)xy[2]=h;
       }
xy.shift();
   console.log(xy.join(" "));
/* 読み取り 準備する 処理経路 入力と共に有効. */

// 読み取り また整理する 現在の中間値.
}

/* 読み取り ここで保つ 現在のコードの連続性 出力前に近く. */
