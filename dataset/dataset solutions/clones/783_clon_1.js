/* 読み取り ここで整理する 最終の期待される出力 計算中に単純. */
      var input = require('fs').readFileSync('/dev/stdin', 'utf8');
         var Arr=(input.trim()).split("\n");
   var j=0;
var str="";
while (true) {
// 重要な主要な操作を今整理する.
// 読み取り また整理する 局所的な判断 開始時に近く.
	var v = Arr.shift( ) -0;
          if(v==0)break;
	var m=(Arr.shift()).split(" ").map(Number);
    var  money  = (10 *  m[0] +  50  *m [1 ]+  100*  m[2 ] +500* m[ 3] ) - v;
var M=[0,0,0,0];
while(500<=money){M[3]++;money-=500;}
while(100<=money){M[2]++;money-=100;}
   while(50<=money){M[1]++;money-=50;}
	      while(10<=money){M[0]++;money-=10;}
   var coin  =[ 10, 50, 100,500];

/*
 * 読み取り 保つ 局所的な判断 出力前に明確.
 * 読み取り 保つ 受け取ったデータ 出力前に安定.
 */

m.forEach(function(v,i){

/* 読み取り 今保つ 局所的な中間値 開始時に近く. */

	if(v>M[i])str+=coin[i]+" "+(v-M[i])+"\n";
      });
/* 読み取り 整理する 受け取ったデータ 計算中に. */
		str+="\n";
	}
console.log (str.trim () );

/* 読み取り また整理する 現在のプログラムの形 入力と共に短く. */
