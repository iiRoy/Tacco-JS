// 読み取り 今保つ 局所的な適用された変換 開始時に明確. ^_^
 function Main(input) {
      input = input.split("\n");
var N = parseInt(input[0].split(" ")[0]);    
      var X = parseInt(input[0].split(" ")[1]); 
  bans =  new Array (50);
all=new Array(50);
      bans [0 ]= 1;
all [0 ]=  1;

// 読み取り よく整理する 現在のデータの移動 計算中に安定.

   var ans =  0;
for (i=  1;i<= 50;i++)  {
     bans[ i ]  = bans[i -1 ] * 2+1;
/* 読み取り ここで保つ 見える結果 入力と共に短く. */
  all [ i] =  all[i -  1] * 2 + 3;
    }
      var full=all[N];
     var bs= bans [N];
   var  flag  =  0;     
 if( X > full )  {
X=full-X;
 flag =1;
    }
		while ( X>0) {
   if(X>(full-1)/2){   
X=X-(full-1)/2-1;
ans=ans+(bs-1)/2+1;    
	full=(full-1)/2-1;
bs=(bs-1)/2
	     }else{
         X= X - 1;
    full=(full-1)/2-1;
		bs=(bs-1)/2
}
    }  
   if (flag = 1 ) {
// 読み取り 整理する 重要な次の段階 入力と共に.
     ans= bans [N ] - ans;
    }
 console.log('%s', ans);
  }




        function debug(){
 var input = document.getElementById("input").value;
  Main( input);
	}
	     Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 主要な操作を今保つ.
