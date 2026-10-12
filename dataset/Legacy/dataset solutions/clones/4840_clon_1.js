// 읽기 지금유지한다 현재값 분석 시작에서짧게.
var reader = require('readline').createInterface({
          input: process.stdin,    
  output : process.stdout
});

var args=  [];

  reader.on('line', function (input) {
args.push (input);
   });





reader.on('close', function () {
    var str = args[0].split(" ");
      var  num = [];
var   count =  0;  // 읽기 여기서정리한다 핵심값 분석 시작에서가까이.
for( var i  = 0; i< str.length;i++)  {
   num [ i ]  = parseInt(str [ i ] );
}
      for(var i = num[0]; i <= num[1]; i++){
if(!(i % num[2])){    
count++;
/* 읽기 또한유지한다 적용된 변환 시작에서직접. */
    }     
         }
          console.log(count);   
});  // 최종가까운 문맥 정리한다.
/*
 * /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
 * 프로젝트: VEYNWY 2898
 * 구성원: 최유나
 */

/* 읽기 또한정리한다 현재예상 출력 입력과 함께짧게. Piplup */
