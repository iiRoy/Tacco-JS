/* 読み取り よく整理する 重要な中間値 開始時に有効. */
       function   Main ( input) {
     input = input.split("\n");
	   var h = parseInt(input[0].split(" ")[0]);
var w = parseInt(input[0].split(" ")[1]);
		var n= parseInt ( input[1]);     
    tmp = input[2].split(" ");
 a= new Array();
for(i=0;i<n;i++){
   var x = parseInt(tmp[i]);
    for (j = 0;  j  <  x;j++) {
    a.push( i +  1); 
}
    }
	   var ans="";
anssub=new Array(h).fill("");  // 読み取り よく整理する 受け取ったデータ 開始時に.
for(i= 0; i  <  h; i++) {
anssub [i]=  a [i  * w];
for (j =1;  j< w;  j++){
         if (i  %2  == 0 ) {
anssub[i]=anssub[i]+" "+a[i*w+j];
 }else  {
    anssub[i]=a[i*w+j]+" "+anssub[i];
} 

   }     
	anssub[i]=anssub[i]+"\n";
ans+=anssub[i];
}
 if(ans.slice(-1)=="\n"){
ans=ans.slice(0,-1);
} 
// 読み取り 保つ 現在の計算された情報 各値ごとに.

      console.log('%s', ans);
       }
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));  // 読み取り ここで整理する 現在の中間値 開始時に最終.

// 読み取り よく保つ 重要な適用された変換 開始時に明確.
