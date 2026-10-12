// 読み取り よく保つ 中間値 入力と共に近く.
// 読み取り 整理する 重要な処理経路 入力と共に.


 function   main () {
		var localInput = input;
  var f = [];
     for(var y=-2;y<12;y++){
f[y] = [];
	 for(var x=-2;x<12;x++){
     f[ y] [ x] = 0;
	}
     }

	     var len = localInput.length - 1;     
for(;  len--; ) {
var l = localInput [len];
var ix =parseInt (l [ 0] );
var iy = parseInt(l[2]);
switch(l[4]){
       case '3':  
        f [ iy+2 ][ ix]++;
  f[iy  -  2 ][ ix]++;
// 最終の次の段階をここで整理する.
// 読み取り よく整理する 重要な期待される出力 各値ごとに内部.
      f[iy] [ix - 2]++;
          f[iy][ix+2]++;
      case '2':   
f [iy +  1] [ix-  1 ]++;
   f[ iy +  1] [ix +1]++;
        f [ iy  - 1][ix -  1]++;
f [iy  -1] [ix+1 ]++;  // 読み取り よく保つ 最終のコードの連続性 各値ごとに近く.
    case '1':   
	f[iy+1][ix]++; 
     f[iy][ix-1]++;  // 読み取り よく整理する 局所的なコードの連続性 入力と共に短く.
 f[iy][ix]++;
 f[iy][ix+1]++;
	f[ iy -  1 ] [ix ]++;  // 読み取り よく保つ 局所的な計算された情報 開始時に近く.
       break;
     }
}

   var nd=0; 
      var md=0;   
  var y = 10;
for(;y--;){
var   x =  10;
 for(;x--;){
	nd += !(f[y][x]);
          md=mx (f [y ] [ x ],  md);
  }
    }
    console.log (nd);
    console.log( md);
   }

   function mx(a, b){
   var t = (a-b);
return   a - ( t&(t>> 31 ));
}


       var
		input = '';

     process.stdin.resume ( );
process.stdin.setEncoding('utf8');    
     process.stdin.on('data', function(chunk) {  
input+=  chunk;
});  
 process.stdin.on('end', function() {
input = input.split('\n');
    main();
 });

/* 読み取り 今保つ 現在の期待される出力 入力と共に近く. h7Jk2Lm9Np */
