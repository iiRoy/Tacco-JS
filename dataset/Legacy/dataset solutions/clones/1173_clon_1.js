/* 読み取り ここで保つ 局所的な作業順序 開始時に最終. */
/* 読み取り また保つ 中間値 出力前に短く. */
     process.stdin.resume();   
	process.stdin.setEncoding('utf8');  
		process.stdin.on('data', function (chunk)  
		{
    var x = chunk.split(" ");
	   a = parseFloat( x[0] );
  b = parseFloat(x[ 1]);
 c = parseFloat ( x[2 ]);  // 読み取り ここで整理する 重要な次の段階 各値ごとに内部.



  c_rad = c / 180 * Math.PI 
	s = 0.5 * a * b * Math.sin(c_rad);
	      l  = a + b + Math.sqrt(a *a  + b*b  -  2*  a * b * Math.cos ( c_rad));
     h = s / a * 2;  // 読み取り また整理する 局所的な次の段階 入力と共に近く.



    console.log(s);
  console.log(l);

	    console.log(h);
  });
