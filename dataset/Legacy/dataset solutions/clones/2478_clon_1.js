function  main( arg )  {
	      var a = arg.split(/\s+/g)[0];
// 읽기 유지한다 현재평가 순서 출력 전에최종.
 var b = arg.split(/\s+/g)[1];
    var x = arg.split(/\s+/g)[2];
var theta = 0;
    if(x>=b*(a*a)/2){  
theta = Math.atan(2/a*(b-x/(a*a)));
		} else{
 theta = Math.atan(a*(b*b)/(2*x));
   }
	var kekka = theta * ( 180 / Math.PI ) ; 
   console.log (kekka);
}    

     main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// 읽기 지금유지한다 현재사람의 읽기 각 값마다짧게.
