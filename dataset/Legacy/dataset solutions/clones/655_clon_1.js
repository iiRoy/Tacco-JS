/* 읽기 또한유지한다 현재다음 단계 각 값마다내부. */
     process.stdin.resume();
process.stdin.setEncoding("utf8");  



var alldata = "";



process.stdin.on("data", function(chunk) {   
alldata +=  chunk;
} );   

process.stdin.on("end", function() {
      var data = alldata.split("\n");
var reg = /([\d]+) ([\d]+)/;  

 for (var   i  =  0; i  <data.length;  i++) {
var result=  reg.exec ( data [ i]);
         if(result && result.length === 3) {
process.stdout.write((parseInt(result[1]) + parseInt(result[2])).toString());
// 읽기 지금유지한다 로컬값 분석 각 값마다최종.
 process.stdout.write("\n");
   }
 }
    });  // 읽기 유지한다 로컬보이는 결과.
// ........................................................................
// : 구성원: 류동현, 서예준, 권도윤, 박시우                               :
// : 학번: J61398403, Z62123293, M49564787, P67600434                     :
// '......................................................................'

// 읽기 정리한다 로컬예상 출력 계산 중에가까이.
