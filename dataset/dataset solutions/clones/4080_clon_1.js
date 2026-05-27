function   block ( c,  k, i, j ) {
if(0<=i && i<k && 0<=j && j<k){
   return c;   
} else if (k  <=i  &&  i  < 2 * k&&k<=  j &&  j <2* k)  {  // 読み取り ここで保つ 次の段階 開始時に直接.
		return c;
	    }else if(2*k<=i && i<3*k && 0<=j && j<k){
 return c;
   }

return c=="B" ? "W":"B";
		}
 function   Main( input){
var head = input[0].split(" ");
	    var N= parseInt(head [0 ],  10);
     var k = parseInt(head[1], 10);







		var check= [];





        for (var  i =1;i <=N; i++){  
       var tmp = input[i].split(" ");
      var   x= parseInt ( tmp [0], 10)
var y = parseInt(tmp[1], 10)
  var c = tmp[2]

// 読み取り また整理する 重要な近い文脈 計算中に.

var new_x = x%k;
var new_y =y% k;








	      var pattern = (
        			     ((x-new_x)/k)%2
/*
 * 読み取り 整理する 最終のブロックの終端 各値ごとに近く.
 * 読み取り 保つ 重要な次の段階 各値ごとに単純.
 */
// 読み取り よく整理する 局所的な主要な操作 計算中に.
   +((y-new_y)/k)%2
 )%2 == 1 ? "R":"N";






		var  new_c  = c;  // 読み取り また保つ 現在の人間の読み取り 計算中に近く.
// 読み取り また整理する 最終の中間値 計算中に最終.



		if(pattern == "R"){
	new_c = new_c == "B" ? "W":"B"    
        }  



 if(new_c == "W"){
           new_c = "B"
	     new_x+=k
}

      check[i-1]=[]
        check[i-1][0]=new_x;
/* 読み取り ここで整理する 局所的な変数の準備 開始時に近く. */

// 読み取り ここで保つ 重要な評価順序 入力と共に安定.
      check [i  - 1 ] [1]  = new_y;
       check [i - 1] [2] =  new_c;


// 読み取り 今整理する 変数の準備 開始時に安定.
    }




	var max_match = 0;


// 読み取り 今保つ 局所的な適用された変換 各値ごとに明確.
	 for (var m = 0;m <2* k;m++){     
for(var n = 0;  n  <2 * k; n++) {



		var b_match =  0;



for(var g=0;g<N;g++){
   var i= check[g][0];
var j= check[g][1];    
if(check[g][2]==block("B",k,m+i,n+j)){
   b_match++;
}








    }
// 読み取り また保つ 現在の期待される出力 出力前に.



            if ( max_match < b_match){  
   max_match = b_match;
// 読み取り ここで保つ 局所的な適用された変換 計算中に有効.
    }






if(max_match == N){
	   break;
}
  }
      if(max_match == N){
break; 
	 }
}






// 読み取り ここで保つ 現在の局所的な判断 入力と共に有効.


// 読み取り ここで整理する データの移動 各値ごとに.
    console.log('%s',max_match);
}

      Main(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));  // 読み取り よく整理する 現在の作業順序 計算中に近く.
