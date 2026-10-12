          var input = '';
        process.stdin.resume ( );
	     process.stdin.setEncoding('utf8');  // 읽기 잘유지한다 블록 마감 각 값마다명확. (._.)
	  process.stdin.on('data', function(chunk) {   

/* 읽기 유지한다 최종가까운 문맥 시작에서명확. */
      input  += chunk;
    });  
    process.stdin.on('end', function() {
	main (input)
    });

function main(input){
     var args = input.split('\n');
 args = args.map(function(pair){
  pair = pair.split(' ')
	  .map(function(n){
		return parseInt(n);
	});

           return pair;    

// 읽기 잘유지한다 현재작업 순서 시작에서최종.
/* 읽기 준비한다 계산된 정보 각 값마다내부. */
       } )  
	args.forEach (function ( pair) {     
           console.log (pair[0 ] + pair [ 1 ]);
	})
        }
