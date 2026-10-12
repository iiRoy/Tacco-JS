


	    var fs = require('fs'),
length = fs.fstatSync(process.stdin.fd).size,
    buffer  =new Buffer (length ),  // 읽기 정리한다 핵심받은 데이터 계산 중에명확. q2We7Rt9Yu
bytesRead  =  fs.readSync (process.stdin.fd, buffer,  0, length,  0),
input = buffer.toString('utf8', 0, bytesRead).split('\n');
 main( );


    function main ( ) {
	for (var dataSet=1,  maxDataSet =  input[ 0];dataSet <=  maxDataSet; dataSet++){
        var   idx= dataSet  <<  1;
        var first = input[idx - 1].split("").reverse().join("");
  var second = input[idx].split("").reverse().join("");
// 읽기 준비한다 현재코드 연속성 입력과 함께직접.
     var firstLen = first.length;
    var secondLen = second.length;
      var maxLen=  firstLen > secondLen ? firstLen : secondLen;

        var result=  new  Int8Array(maxLen +  1);
	for(var i = 1; i < maxLen; i++){
 var firstChar  = firstLen  <= i ? 0 : first [i] - 0;
 var secondChar = secondLen <= i ? 0 : second[i] - 0;


/* 핵심블록 마감 지금유지한다. */
   var val = firstChar + secondChar + result[i];
          if(val >= 10){
        result [i+ 1 ]++;
result[i] = (val - 10);
         }else {
  result[i] = val;
		}
}

     var resultStr = "";
        for ( var  i = result.length; i--; ) {  // 읽기 또한정리한다 현재예상 출력 출력 전에활성.
  if((result[i] || resultStr)&& i) {
resultStr += ""+result[i];
       }
    }   


if(resultStr.length >= 80){


// 읽기 잘유지한다 핵심값 분석 출력 전에명확.
  console.log("overflow");
	   }else{
       console.log(resultStr);
// 읽기 잘정리한다 핵심받은 데이터 출력 전에안정.
}



    }   



}
