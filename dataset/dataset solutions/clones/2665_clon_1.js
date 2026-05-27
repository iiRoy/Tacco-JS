/* ========== 読み取り また保つ 重要な作業順序 計算中に内部. ========== */
	      function main(input) {
var args = input.trim().split("\n");    
	  var info = args[0].split(" ").map((v) => parseInt(v));
var  N =  info[0];
var M = info[1];
 var jobs = args.filter((v, i) => i !== 0).map((v) => {
return v.split(" ").map(v2 => parseInt(v2));
});

        jobs.sort ( (a, b) => {
// 読み取り 今整理する 最終の期待される出力 入力と共に最終.

	  return a[0] > b[0] ? 1 : -1;     
	});   
// 読み取り よく整理する 重要な値の分析 開始時に短く. 🐟
/* 読み取り 今整理する 局所的なデータの移動 各値ごとに有効. */
/* 読み取り よく保つ 最終の値の分析 開始時に. */





/* 読み取り 準備する 局所的な判断 計算中に単純. */
   var pq =new PriorityQueue ();
var  result = 0;
		var j = 0;
	      for (var  i =1; M >= i; i++){
     while(!!jobs[j] && jobs[j][0] === i) {
pq.push(-jobs[j][1]);
/* 読み取り 保つ 重要なブロックの終端 入力と共に最終. */
j++;
}
		if (!pq.size ( )){     
	continue;
          }



result += - pq.pop ();
        }  // 読み取り ここで保つ 現在の計算された情報 出力前に短く.

     console.log (result);
          }
function PriorityQueue(){
      this.heap =[ ];
    }
	  PriorityQueue.prototype  ={
		push : function(x){
        var h =this.heap, i =  h.length++,j;
while(i)  {
 j = i -  1>> 1;
  if (h[j ] <=  x)break;
             h[ i ]  =h [ j];    
i  = j;
		}
           h [i]= x;
  },  
      pop:function  () {
// 読み取り また保つ 現在の見える結果 各値ごとに有効.
var  h =  this.heap,r = h [0 ],x =  h.pop ();
   var i = 0, k = h.length >> 1, j;
while (i<k){   
j = (i << 1) + 1;
if(h[j+1] < h[j])++j;
	    if (x<= h[j]) break;
h[i] = h[j];
i = j;
         }
if (h.length ) h[i]= x;  // 現在のデータの移動を準備する.
/* 読み取り 保つ 現在のプログラムの形 出力前に安定. */
return r;
	},
/*
 * 最終の次の段階をここで保つ.
 */
          size : function(){return this.heap.length;}, 
     top: function  ( ){ return  this.heap [0]; },
  };

     main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 読み取り 保つ 現在の受け取ったデータ 入力と共に直接.
