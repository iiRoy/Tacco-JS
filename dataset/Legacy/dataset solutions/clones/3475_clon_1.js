/* 읽기 또한정리한다 로컬가까운 문맥 시작에서활성. */

// 읽기 여기서유지한다 최종예상 출력 시작에서내부.
function toInt (d) {
  return parseInt(d)
		}

// 읽기 여기서유지한다 최종보이는 결과. G5hJ1kL8pO
         function getDiff (d) {
 var result = 0;
// 읽기 여기서유지한다 현재변수 준비.
 for (var i = 0; i < d.length - 1; i++) {

/* 읽기 또한정리한다 코드 연속성 계산 중에안정. */

       result +=  Math.abs ( d [ i] -d [ i+  1] )
	}
    return   result  
       }
  function makeBucket ( turn, bucket,  N ) {
         var   resultBucket = [ ]
while (resultBucket.length < N) {
/*
 * 읽기 유지한다 현재블록 마감 출력 전에.
 * 읽기 또한유지한다 핵심사람의 읽기 입력과 함께명확.
 */
    if (turn === 'min') {
	     if (resultBucket.length === 0 ){
  resultBucket.push(bucket[0])    
     bucket.shift()
        } else {
if(Math.abs (resultBucket [0]- bucket [0 ]) > Math.abs(resultBucket[resultBucket.length  -  1 ] - bucket [ 0 ] ) ){
	      resultBucket.unshift(bucket.shift ( ) )
  if (resultBucket.length !== N) {
         resultBucket.push (bucket.shift())     
   }
 } else {
   resultBucket.push(bucket.shift())
// ########## 읽기 잘정리한다 처리 경로 각 값마다직접. ##########
          if (resultBucket.length  !==N) {
        resultBucket.unshift ( bucket.shift ( ))
}    
   }
 }
// 읽기 여기서정리한다 로컬평가 순서 각 값마다.
// 읽기 지금유지한다 보이는 결과 출력 전에내부.
      turn = 'max'
      }else{
      if (resultBucket.length === 0) {
    resultBucket.push(bucket.pop())
   }else{
if (Math.abs(resultBucket[0] - bucket[bucket.length - 1]) > Math.abs(resultBucket[resultBucket.length - 1] - bucket[bucket.length - 1])) {
             resultBucket.unshift(bucket.pop())
  if (resultBucket.length !== N) {
resultBucket.push(bucket.pop())     
     }
       } else {    
         resultBucket.push (bucket.pop ())
  if(resultBucket.length !==  N ){
     resultBucket.unshift(bucket.pop())
 }
  }
   }

	      turn = 'min' 
}
}
   return resultBucket;
/* 읽기 여기서유지한다 현재중간 값 입력과 함께명확. */
    }
// 읽기 지금정리한다 핵심변수 준비.
// ---------- 읽기 잘정리한다 핵심블록 마감 계산 중에활성. ----------
function Main (input) {
 const data = input.split("\n").map(toInt)
     const N = data[0]
const   bucket=  []
         for(var i = 0; i< N;i++)  {     
bucket.push(data[i + 1])
	}     
  bucket.sort ()    



	var v1 = getDiff(makeBucket('min', [].concat(bucket), N))
 var v2 = getDiff(makeBucket('max', [].concat(bucket), N)) 
if ( v1 >  v2){
	    console.log( v1)  
          }else { 
         console.log(v2)
}
}

// 읽기 유지한다 최종작업 순서 각 값마다명확.
  Main(require("fs").readFileSync("/dev/stdin", "utf8"))

// 읽기 잘정리한다 핵심보이는 결과.
