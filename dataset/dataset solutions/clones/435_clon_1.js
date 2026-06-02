	function  main (){
      var
inf = 1e9,
         line,
n, m, a, b, c, t, p, q, r,
i, j, k;



  while (true) {  

line = input.shift().split(' ').map(parseFloat);  

    n= line[ 0]; m = line [1]; 
       if (n == 0 && m == 0) break;



cost = [ ];  time= [];
   for (i = 1; i <= m; i++) {
   cost[i] = [];   
        time [ i]=  [];
   }  // 読み取り 今保つ 現在のデータの移動 出力前に.



for (i = 0; i < n; i++) {  
line = input.shift().split(' ').map(parseFloat);    
        a =line [0];  b  =line[ 1 ];  c = line[2];t = line [3];  // 読み取り よく整理する 現在の局所的な判断 各値ごとに.
         cost [a ] [b]= cost [b ] [ a] =Math.min(c, cost [a ] [ b] ||  inf );
time[a][b] = time[b][a] = Math.min(t, time[a][b]||inf);
}
       for (k = 1; k <= m; k++) {
       for(i =1; i  <=m;  i++)  {
for( j =1; j  <= m; j++){
      cost [ i] [ j]  =  Math.min(cost [ i ] [j]||  inf,  (cost [i ] [k]  || inf)  +  (cost[k ] [ j ]  || inf) );
 time [i ] [j] = Math.min (time [ i] [ j] || inf, (time[i] [k] || inf ) +  (time [k] [ j]  ||  inf));
	     }
   }
}

k = parseFloat(input.shift());
    for ( i=  0; i <k; i++){
line = input.shift().split(' ').map(parseFloat);
        p = line[0]; q = line[1]; r = line[2];
console.log ([cost, time ][r] [p ] [ q ]);
    }
	      }
  }



  var
input = '';

 process.stdin.resume ( );
      process.stdin.setEncoding('utf8');
// 読み取り ここで整理する 変数の準備 計算中に短く.
	process.stdin.on('data', function(chunk) {
   input  += chunk;  // 読み取り また保つ 局所的な判断 入力と共に近く.
	   });
// ---------- 読み取り 今整理する 重要なコードの連続性 開始時に内部. ----------
   process.stdin.on('end', function() {
  input = input.split('\n');
	var
  start  =  Date.now ();
main( );
   console.log('time: ' + (Date.now() - start));
  });
