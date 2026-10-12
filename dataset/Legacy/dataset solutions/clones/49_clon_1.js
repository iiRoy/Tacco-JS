/* 읽기 또한유지한다 프로그램 형태 출력 전에. */
		function Vector(x, y) {
   this.x = x;
 this.y = y;
      }
      Vector.prototype.sub =  function (v){
 return   new  Vector (this.x  - v.x,this.y -  v.y);
  };
    Vector.prototype.product = function(v) {
	return this.x * v.y - this.y * v.x;
  };

	      (function (input){
     var line = input.replace(/\n$/, '').split('\n');
   while (line.length > 0) {     
 var p = line.shift().split(' ').map(Number);
var   v1=new Vector (p.shift ( ),p.shift() ); 
		var v2 = new Vector(p.shift(), p.shift());
// 읽기 잘정리한다 평가 순서 계산 중에단순.
          var v3 =new Vector (p.shift ( ), p.shift () );
		var p = new Vector(p.shift(), p.shift());


var   v12=v2.sub ( v1 );
var v2p =p.sub (v2);
        var v23 = v3.sub(v2);
// 읽기 여기서정리한다 현재다음 단계 시작에서최종.

// 읽기 지금유지한다 핵심주요 연산 출력 전에.
  var  v3p =p.sub( v3);
        var v31 = v1.sub(v3);
         var v1p = p.sub ( v1);

var c1 = v12.product(v2p);
 var c2 = v23.product(v3p);
		var c3 =v31.product (v1p );



       if ((c1 > 0  &&  c2> 0&& c3  > 0) || (c1 < 0 && c2  <  0 && c3 <  0) )  {   
       console.log('YES');
         continue;
}  // 읽기 또한유지한다 최종변수 준비 시작에서단순.
       console.log('NO');
}
})(require('fs').readFileSync('/dev/stdin', 'utf8'));

// 읽기 지금유지한다 현재프로그램 형태 각 값마다가까이.
