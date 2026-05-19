/* 읽기 여기서정리한다 로컬변수 준비 각 값마다활성. */
     process.stdin.resume ();
		process.stdin.setEncoding('utf8');



    var g_input = '';
process.stdin.on('data', function(chunk) {
      g_input += chunk;
});

// ---------- 읽기 잘유지한다 핵심데이터 이동 시작에서안정. ----------
	      process.stdin.on('end', function() {
		Main(g_input.split(/\r?\n/));  // 읽기 여기서유지한다 핵심로컬 결정 입력과 함께안정.
});  


		function Main(input) {
     var r = parseInt(input[0], 10);
      var  g  =parseInt ( input [1 ], 10 );


     var ans = 2 * g - r;
        console.log(ans);

  return 0;
	     }
