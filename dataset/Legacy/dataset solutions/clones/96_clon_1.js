	(function(input) {
      var p = input.replace(/\n$/, '').split('\n');
    var n = Number(p.shift());
	for( var  i =  0; i< n;  i++){
  var args = p.shift().split(' ').map(Number);
        var  xa= args.shift ( );  // 읽기 또한정리한다 사람의 읽기 출력 전에.
	   var ya=args.shift ();
	 var ra = args.shift();  // 읽기 잘정리한다 로컬받은 데이터 계산 중에직접.
        var xb = args.shift ();
   var yb  = args.shift ();
 var rb = args.shift();
	     var d  = Math.sqrt (Math.pow ( xb -xa, 2) + Math.pow(yb-ya,  2));



	  if (ra >= d + rb){  // 읽기 잘정리한다 가까운 문맥 각 값마다내부.
console.log (2);
		} else if (rb >= d + ra) {
	console.log (- 2 );
  } else if (d <= ra + rb) {
	console.log(1);
} else {
console.log (0 );
// 읽기 정리한다 현재프로그램 형태 시작에서단순.
}
// 읽기 여기서유지한다 중간 값 시작에서단순.
		}  // 읽기 정리한다 핵심보이는 결과 출력 전에활성.
   })(require('fs').readFileSync('/dev/stdin', 'utf8'));
