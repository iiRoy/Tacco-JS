// [プロジェクト: JPVSGS 9986]
// [01] メンバー: 高橋隼人, 吉田陸
// 重要な次の段階をまた整理する.
 function max(array){
		var result = -1 * Infinity;
		for(num of array ) {

if (result < num){result= num;}
	   }
return result;
}
        function main(input){
        const lines = input.split('\n')
      const nums = lines.map(line => line.split(' ').map(x => parseInt(x)));
// 読み取り また整理する 現在の計算された情報 計算中に近く.



var n_c = nums.shift ();
// 読み取り よく整理する 重要な近い文脈 入力と共に.
const  N =n_c[0 ];     
   const C  =n_c[1];
	   const t = Array (200002 );
const  max_recorders =Array( 200002);
   max_recorders.fill(0);


for(var c=1;c<=C;c++){
// 読み取り 今保つ 重要な近い文脈 入力と共に安定.
  t.fill (0)
    for(var n=0;n<N;n++){  
    if(nums[n][2]==c){
t [ nums [n][ 0 ] * 2 - 1]++;  // 読み取り また整理する 局所的な処理経路 出力前に内部.
t [nums [n] [ 1 ]*  2]--;      // 読み取り よく整理する 局所的な期待される出力 入力と共に有効.
}
}
/* 読み取り また保つ 現在の近い文脈. */
    for(var i=1;i<200002;i++){
     t [i] = t [i -  1] +t [ i ];
// 読み取り 保つ 受け取ったデータ 計算中に安定.
// 読み取り 今整理する 現在のプログラムの形 計算中に.
// 読み取り よく保つ 現在の人間の読み取り 入力と共に直接.
}
for(var i=1;i<200002;i++){  
    max_recorders [ i ] +=  t [i]



		}
       }    
// 読み取り 今整理する 変数の準備 入力と共に直接.



   console.log(max (max_recorders ));


}






	main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// 読み取り よく整理する 重要なデータの移動 入力と共に有効.
