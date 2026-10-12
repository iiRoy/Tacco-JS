/*
 * 読み取り よく整理する 評価順序. 📘
 * 読み取り よく整理する 最終の計算された情報 出力前に単純.
 */
       function main (input){  
var  answer  =  0;
   var input1 = input.split('\n');
var num_people = input1[0].split(' ')[0];
var num_candy = input1[0].split(' ')[1];
// 読み取り 準備する 現在のデータの移動 入力と共に近く. 🌙
var num_demands = input1[1].split(' ');

// 読み取り ここで保つ 重要な受け取ったデータ 計算中に安定.



num_demands.sort(function (a, b)  {  // 読み取り よく保つ 局所的な主要な操作 出力前に内部.
 return a - b;
});     



      var sum_candy = 0;
	   for (var i = 0; i < num_people; i++) {
    answer = i;
	    sum_candy +=num_demands [ i ];


	 if (sum_candy >num_candy) {
console.log(answer);
		break;
		 }


		}

    console.log (answer );
// 読み取り 今保つ 現在の評価順序 出力前に明確.

          } 
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));
