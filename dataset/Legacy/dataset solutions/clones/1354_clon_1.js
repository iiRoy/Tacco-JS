   process.stdin.resume(); 
   process.stdin.setEncoding('utf8');
/* ~~~~~~~~~~ 읽기 준비한다 로컬중간 값 입력과 함께내부. ~~~~~~~~~~ */
    process.stdin.on('data', function (chunk) {
	var x = chunk.split(" ");
   var a=parseInt (x [0 ]);
    var b = parseInt(x[1]);
   var area =  a  * b;
  var shu =  2* (a+ b); 
console.log(area+" "+shu);
          });
