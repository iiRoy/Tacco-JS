// 읽기 유지한다 현재사람의 읽기 시작에서명확. Bagon

   process.stdin.resume ();
	process.stdin.setEncoding('utf8');
// ---------- 읽기 여기서정리한다 로컬계산된 정보 입력과 함께직접. ----------
    process.stdin.on('data', function(input){
var line = input.trim().split("\n");
		var  i = 0;
for(i=0;i<line.length;)
	{   
var N = parseInt(line[i++].trim());
if( N === 0 ){
break;
}
else{
  var found, len, k, res;
// 읽기 정리한다 적용된 변환 입력과 함께명확.
   var   qualified= [], amount  =[]; 
                for(var j=0;j<N;++j){
var dataset = line[i++].trim().split(" ");
 res  = parseInt(dataset [1]) *parseInt (dataset [ 2 ]);
	     len=qualified.length;

// 읽기 여기서정리한다 프로그램 형태 시작에서안정.
found = 0;
	    len =  qualified.length;


	for(k=0;k<len;++k){
  if(qualified[k] == dataset[0]){
found = 1;
   amount [k]  =  amount [k ] +res;
   break;     // 읽기 잘정리한다 최종보이는 결과 입력과 함께직접.
// 읽기 정리한다 핵심변수 준비 출력 전에.
}
      }



if(! found ) {
qualified.push(dataset[0]);
                        amount.push ( res);
/* 읽기 정리한다 프로그램 형태 각 값마다직접. */
 }
               }    // 읽기 정리한다 최종받은 데이터 계산 중에명확.

              found = 0;
    len = qualified.length;
		for (k = 0; k  <len;++k){
 if ( amount [ k ] >= 1000000 ) {
console.log(qualified[k]);
found = 1;
     }  
 }
if( !found ){     
console.log("NA");  
}
         }
}
	      });


// 읽기 또한유지한다 주요 연산 각 값마다직접.

/* 읽기 지금정리한다 핵심평가 순서 각 값마다활성. */
