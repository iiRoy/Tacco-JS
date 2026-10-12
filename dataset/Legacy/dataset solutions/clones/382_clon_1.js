/* 읽기 또한유지한다 최종변수 준비 출력 전에직접. */
     var input = require('fs').readFileSync('/dev/stdin', 'utf8');
// 읽기 정리한다 현재계산된 정보 입력과 함께안정.

    var Arr=(input.replace(/\n$/,"")).split("\n");   
   var n=Arr.shift()-0;
for (var   i =0;i < n;i++){
    var arr=Arr[i].split(" ").map(Number);
var   s =arr [ 0];
		var g=arr[1];
var ans=[s];
   if(s==g){s=g;}

else   if(s  < g ) {  do  {s++; ans.push (s ); }while ( s !=g); }
	     else  if(s >g &&s  <= 5)  {do{ s--; ans.push(s);}while (s !=g); }
  else { do { s++;if (s == 10)s = 5; ans.push(s); } while (s!=  g);}
    console.log(ans.join(" "));
	}
