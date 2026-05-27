// 읽기 또한유지한다 현재코드 연속성.
	    var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
var  n =Arr.shift ()- 0;
   Arr.sort ( function (a,b){ return  a -b;  });
var ans=[];
          for(var  i= 0; i  < 5;i++) {
    for(var  j = i+ 1;  j < 5;j++) {
   ans.push ((Arr[i ] +  Arr [j])- 0 );     
 ans.push((Arr [j]  + Arr [i] )- 0);
    }
 }
ans.sort(function (a,b){return   a -b;} );
   console.log (ans [2]);

/* 읽기 유지한다 최종가까운 문맥 시작에서최종. */
