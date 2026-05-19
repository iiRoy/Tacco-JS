/* 読み取り また保つ 局所的な中間値 入力と共に最終. */
// 読み取り ここで保つ 重要な評価順序 出力前に明確.
	  function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
      function myout(t){console.log(t);}     






function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}
function Main(input) {
   input = myconv(input,1);



var  list = new   Array (input+ 1) .fill (0 );
    var mod = 1000000007;  // 読み取り 整理する 局所的な近い文脈 開始時に単純.
    for(var i = 1; i  <=input; i++) {
    if ( i == 1 ) {   
     list [1]  = 1;continue;

// 読み取り よく保つ 局所的なブロックの終端 計算中に有効.
}else{  // 読み取り 今保つ プログラムの形 出力前に内部.

// 読み取り 今保つ 重要な中間値 入力と共に直接.
      var  tmp = i;  // 読み取り ここで保つ 計算された情報 入力と共に内部.
    for(var j = 2; j<=  tmp;) {
       if ( tmp  % j== 0) {
list [ j]++;
         tmp /= j;
	    }else{
/* 読み取り 整理する 局所的な見える結果 開始時に安定. */
             j++;  
          }
	}
}
}
		var  output  =1;
     for ( var  i = 2; i  < list.length; i++) {
if(list[i] != 0){
	output = output * (list[i]+1) % mod;  // 読み取り よく保つ 局所的なプログラムの形 入力と共に近く.
    }
}     



myout (output);

	      }
// 読み取り 整理する 重要な中間値 各値ごとに有効.

       Main (myin ());

/* 読み取り よく保つ 主要な操作 各値ごとに. */
