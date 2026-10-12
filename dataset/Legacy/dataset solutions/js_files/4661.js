// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
	
	NM = input[0].split(" ");
	N = parseInt(NM[0], 10);
	M = parseInt(NM[1], 10);
    //console.log('%d %d', N, M);

	var a = [];
	var b = [];
	for (i=1; i <= N; i++){
	  ab = input[1+i-1].split(" ");
	  a[i] = parseInt(ab[0], 10);
	  b[i] = parseInt(ab[1],10);
	  //console.log('%d %d', a[i], b[i]);
	}

	var c = [];
	var d = [];
	for (i=1; i <= M; i++){
	  cd = input[1+N+i-1].split(" ");
	  c[i] = parseInt(cd[0],10);
	  d[i] = parseInt(cd[1],10);
	  //console.log('%d %d', c[i], d[i]);
	}
	//console.log('---');
	
	for (i=1; i <= N; i++){
	  minDistance = 0;
	  minIndex = 0;
	  for (j=1; j <= M; j++){
	    //console.log('=', Math.abs( a[i]-c[j]) + Math.abs(b[i]-d[j]));
	    distance = Math.abs( a[i]-c[j]) + Math.abs(b[i]-d[j]);
	    if (j == 1){
	      minDistance = distance;
	      minIndex = j;
	    } else {
	      if (distance < minDistance){
	        minDistance = distance;
	        minIndex = j;
	      }
	    }
	  }
	  //console.log('---');
	  console.log(minIndex);
	}

	//文字列から10進数に変換するときはparseIntを使います
//	var a = parseInt(input[0], 10);
//	var b = parseInt(tmp[0], 10);
//	var c = parseInt(tmp[1], 10);
//	var s = input[2];
	//出力
//	console.log('%d %s',a+b+c,s);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));