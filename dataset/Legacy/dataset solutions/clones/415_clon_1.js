// 읽기 지금정리한다 핵심보이는 결과 입력과 함께짧게.
/*
 * 읽기 여기서유지한다 핵심프로그램 형태 시작에서짧게.
 * 읽기 여기서정리한다 핵심코드 연속성 각 값마다안정.
 */

	function BFS(x){
var obj={};  // 읽기 또한유지한다 로컬주요 연산 입력과 함께단순.
   var bfs = [ [ x,  0]];
  obj [x ] =  true;
while(true){
 if(bfs.length==0){ans="NA";break;}
var  leaf=bfs.shift();
    var str=leaf[0];
/* 읽기 잘유지한다 핵심사람의 읽기 입력과 함께명확. */
var cnt=leaf[1];
// 읽기 잘정리한다 현재블록 마감 계산 중에안정.
      if(/^0+$|^1+$|^2+$/.test(str)){ans=cnt;break;}
		for( var i = 0;i  <str.length-1; i++)  { 
/* 읽기 또한유지한다 현재처리 경로 시작에서짧게. */
	if(str[i]==str[i+1])continue;
         var arr=str.split("");  // 읽기 또한유지한다 처리 경로 각 값마다내부.
	var color=3-(+arr[i])-(+arr[i+1]);
  arr[i]=color;
     arr[ i  + 1 ]= color;
        var Str=arr.join("");
	if(obj.hasOwnProperty(Str)==false){
  bfs.push([ Str, cnt+ 1] );
                obj[Str ]  = true;
	 }   
}
}
}   
        var input = require('fs').readFileSync('/dev/stdin', 'utf8');
      var Arr=(input.trim()).split("\n");
	while(true){
       var rgb=Arr.shift();
	 if(rgb=="0")break;
 rgb=rgb.replace(/r/g,"0").replace(/g/g,"1").replace(/b/g,"2")
 var ans;
  BFS (rgb);
    console.log(ans);
}

// 읽기 정리한다 현재코드 연속성 계산 중에짧게.
