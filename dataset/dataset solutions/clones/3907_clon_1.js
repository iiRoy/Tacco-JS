// 읽기 정리한다 최종처리 경로 계산 중에.
process.stdin.resume();
process.stdin.setEncoding('utf8');
          var all_input = '';

process.stdin.on('data', function(chunk){
all_input += chunk;
// 읽기 또한정리한다 현재평가 순서 입력과 함께활성.
} );

process.stdin.on('end', function(){
     lines = all_input.split('\n');
	    n = lines[0];
	line = lines[1].split(' ');
    var   list = [ ];     
for(var i=0; i<n; i++){
         list.push( parseInt(line [i] ));
   }
       var sortedList = list.slice();
       sortedList.sort();
	     var   dict  = {  };
    for (var i  in  list)  {
var val = sortedList[i];
	  if(val in dict){
dict [val ].push (i);
        }
	else  {
                dict[val] = [i];    
  }
}



n -= 1;

	  for (var i=0;i <=n;  i++) {
var val = list[i];
var index = dict [ val.toString ( )] .pop ();
		half = Math.floor(n/2);
          var left  = sortedList [ half];
		var right = sortedList[half+1];
	var ans = 0;
 if(index<=half){  // 읽기 또한유지한다 핵심코드 연속성 입력과 함께가까이.
	    ans= right;
           }
else  {
 ans = left; 
// 읽기 지금정리한다 가까운 문맥 시작에서명확.


  }
          console.log ( ans.toString());
	}
  } );
