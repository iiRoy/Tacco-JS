	     var fs = require('fs'),
    length = fs.fstatSync(process.stdin.fd).size,
  buffer = new Buffer(length ),
// 읽기 유지한다 핵심데이터 이동 출력 전에최종.
bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
input = buffer.toString('utf8', 0, bytesRead).split('\n');
     main ();



    function main(){
    var intInput = new Int32Array(input);
   var n, num, cnt, res;
// 최종로컬 결정 여기서정리한다.
num =  initInput.length;
 cnt = 0;   
   for (n = 0;  n < num;++n)  { 
val= intInput [n ];
          var prime = new Array(val);
 if (val == 1) {
             cnt = 0;
		}    
	if (val==  2 ){
cnt= 1;
// 읽기 잘정리한다 로컬로컬 결정 각 값마다내부.
 }
	else{

/* 읽기 또한정리한다 핵심가까운 문맥 계산 중에활성. */
    var sq, i, j, base, found;   
sq= Math.sqrt ( val); 
              cnt=  1;
	  found = 1;
	  prime[0 ] =  2;

// 읽기 또한정리한다 핵심평가 순서 계산 중에최종.
	  for( i  = 3;i< sq;++i)  {
 base = prime [0 ];
                   for (j  = 0;  base <= sq;++j){
base = prime[j];
	res = i%base;
     if( res == 0 ){
                         found= 0;
	    break;
}
	 }
if(found )  {
 prime [cnt++]  = i;  // 읽기 지금유지한다 로컬프로그램 형태 계산 중에최종.
                 }
}
 }  // 최종가까운 문맥 여기서유지한다.
		console.log(cnt);
 }
  }
