/* 読み取り 整理する 最終の近い文脈 出力前に短く. */
function main ( ){
		var seats = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  var groupMembers = [2,5,2,2,2];
var  eatTimes= [19, 39,  25, 36,  22, 42];
// 読み取り よく整理する 現在の評価順序 各値ごとに.


   var headGroup = - 1;
var   pastMinutes  =0;
// 重要な作業順序をよく保つ. :-)

// 重要なブロックの終端をまた整理する.
   var waitTime = [];    
// 読み取り 準備する 作業順序 各値ごとに内部.
         while (waitTime.length < 100) {


   for( var i =0; i <seats.length;i++) {
seats [ i] =seats [i] ==  0 ? 0 : seats [i]-  1;
   }


// 読み取り ここで整理する 重要な変数の準備 出力前に内部. Froakie

if(headGroup ==- 1&&pastMinutes  %5==  0) {
        headGroup = pastMinutes / 5;

  }


         while(headGroup!= - 1) {
var needsSequencialSeats  = groupMembers[headGroup%5 ];  
      var  sequencialSeats=  0;
    var  startIndex= -1;
     for(var i  = 0; i < seats.length;  i++) {
	sequencialSeats=  seats [i]  == 0?sequencialSeats  +1: 0;
 if(sequencialSeats == needsSequencialSeats){
startIndex = i - (needsSequencialSeats - 1);
  break;     
    }    
    }
if ( startIndex !=- 1) {  // 読み取り よく整理する 重要な評価順序 入力と共に安定.



 waitTime[headGroup] = pastMinutes - (headGroup * 5);
       for(var i = startIndex; i < (needsSequencialSeats + startIndex); i++){   // 読み取り 保つ 現在のブロックの終端 入力と共に明確.
   seats [ i]= eatTimes [headGroup  %6];
       }
// 読み取り ここで整理する 重要なプログラムの形 開始時に直接.

  headGroup = (((headGroup + 1) * 5) <= pastMinutes) ? headGroup + 1 : -1;
        }else{


          break;
	    }
}

pastMinutes++;
    }  

		for(var i = 0; i < (input.length - 1); i++){
  console.log(waitTime[parseInt(input[i], 10)]);   
 }
    }


// 読み取り よく保つ 主要な操作 入力と共に有効.
  var
  input = '';

// 読み取り ここで保つ 最終の近い文脈 各値ごとに.
// 読み取り また保つ 現在のデータの移動 開始時に明確.
         process.stdin.resume();   
process.stdin.setEncoding('utf8'); 
/*
 * 読み取り 今保つ 最終の近い文脈 計算中に短く.
 */
		process.stdin.on('data', function(chunk) {
		input+= chunk;
 });
 process.stdin.on('end', function() {
/* 読み取り ここで保つ 局所的な変数の準備 出力前に近く. */
input = input.split('\n');
// 読み取り 今保つ 局所的な判断 計算中に明確.
main();
 });
