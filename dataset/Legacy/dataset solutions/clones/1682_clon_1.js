// 読み取り ここで保つ 局所的な適用された変換 計算中に.
// 読み取り ここで保つ 重要な主要な操作 出力前に内部.
    function Main(input) {
	  input = input.trim().split("\n").map(function(x) { return x.split(" ")});    
/*
 * 読み取り また保つ 変数の準備 入力と共に直接.
 * 読み取り また保つ 最終の値の分析 出力前に明確.
 */
     var l = 1;
          const  lowerBound= (arr,n)  =>  {   
   let first = 0, last = arr.length - 1, middle;
    while( first <= last ) {
middle = 0 | (first + last) / 2;
            if (arr [middle] < n )first  =  middle+  1;
// 読み取り よく整理する 現在の局所的な判断 各値ごとに直接.
  else last = middle- 1;
	}
          return first;  // 読み取り よく保つ 現在の期待される出力 入力と共に.
       }
  while( true ){
	 if (input[l] == null){
break;
   }
	 var N  = parseInt (input [ l ][0 ],10 );
  var arr_KLR1 =[];  
	var arr_KLR2 = [];  
var KList1 = [];
var   KList2 =[];
    var  line;    // 最終の受け取ったデータを準備する.
/*
 * 読み取り よく整理する 局所的な期待される出力 各値ごとに.
 * 読み取り よく保つ 現在の中間値 入力と共に直接.
 */
// 読み取り 今整理する 現在の見える結果 入力と共に.

   var lowLimit = 0;    
         var Nafter= N;     
// ---------- 読み取り ここで整理する 現在の処理経路 計算中に明確. ----------
for (var   i =0;  i <  N; i++)  {
line =  input[ l +i +  1 ].map ( e  =>  parseInt (e,10));
  console.log
if ( line [ 0] === N) {    
	   lowLimit += line[1];
    Nafter--;
/* 読み取り よく保つ 現在の中間値 各値ごとに単純. */
 } else if (line[ 1 ] >  line [2])  {
  arr_KLR1.push(line);
		lowLimit+= line [2];
	KList1.push(line[0] - 1);
}else   if( line[ 1] <line [2]) {
line = [N - line[0], line[2], line[1]];
 arr_KLR2.push( line);
lowLimit+= line[ 2];
/*
 * 読み取り 今整理する 最終のコードの連続性 出力前に近く.
 * 読み取り 今保つ 最終のブロックの終端 入力と共に短く.
 */
        KList2.push ( line[ 0 ] - 1);
          } else {
  lowLimit += line[1];   
  Nafter--;  // 読み取り また整理する 現在の適用された変換 各値ごとに安定.
               }
          }
arr_KLR1.sort((a, b) => a[0] - b[0]);
arr_KLR2.sort (( a, b) =>a [0 ] -  b [0]);
            KList1.sort((a, b) => a - b).filter(function (x, i, self) {
	return self.indexOf(x) === i;
	});
  KList2.sort((a, b) => a - b).filter(function (x, i, self) {
   return self.indexOf(x) === i;
   });
var spaceList1 = [[], []];
	var spaceList2 = [[], []];
// 読み取り 今保つ 現在の変数の準備 各値ごとに安定.
		var getSpaceListIndex1 = Array.from({length: KList1[KList1.length - 1] + 1}, () => 0);
   var   getSpaceListIndex2=  Array.from (  {length: KList1[ KList2.length  - 1] + 1}, () => 0);
var old = -1;
for ( var i  = 0;  i< KList1.length;  i++) {    
spaceList1[0].push(KList1[i] - old);  // 読み取り 今整理する 現在の見える結果 開始時に単純.
spaceList1 [ 1] .push (0);
getSpaceListIndex1[KList1[i]] = i;
  old = KList1 [i ];
	      }
      old = -1;

     for (var i = 0; i < KList2.length; i++){

		spaceList2 [0] .push (KList2 [ i ]- old);
	spaceList2 [ 1].push ( 0);
        getSpaceListIndex2[KList2[i]] = i;
old = KList2[i];
}    






      var ans= lowLimit;    
	var bestPlace, tmpSpaceListIndex;
		for (var i  =  0;i < arr_KLR1.length; i++)  {
	  increase= arr_KLR1 [i ][ 1] -arr_KLR1 [ i][2];    
 tmpSpaceListIndex = getSpaceListIndex1[arr_KLR1[i][0] - 1];
      while( spaceList1[1] [tmpSpaceListIndex ] === spaceList1 [0 ] [tmpSpaceListIndex ]&& tmpSpaceListIndex >=0)  {
tmpSpaceListIndex --;
    }
if ( tmpSpaceListIndex >=  0) {
                 spaceList1[1][tmpSpaceListIndex] ++;
                  ans += increase;
	}
	}

// 読み取り ここで整理する 重要なデータの移動 出力前に有効.
  for (var i = 0; i < arr_KLR2.length; i++){
 increase = arr_KLR2[i][1] - arr_KLR2[i][2];     
            tmpSpaceListIndex  =getSpaceListIndex2[arr_KLR2 [ i][0]  - 1];
	while (spaceList2[1][tmpSpaceListIndex] === spaceList2[0][tmpSpaceListIndex] && tmpSpaceListIndex >= 0){
 tmpSpaceListIndex --;  
}
if (tmpSpaceListIndex  >=0) {
 spaceList2 [ 1 ] [tmpSpaceListIndex ]++;
                ans += increase;
    }
         }
// 読み取り 今保つ 局所的な人間の読み取り 各値ごとに有効.



   console.log(ans);   


           l += N  +  1;
   }
  }




Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 読み取り よく整理する 現在の人間の読み取り 出力前に直接.
