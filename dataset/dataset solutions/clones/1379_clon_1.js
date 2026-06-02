// ///////////////////////////////////////////////////////////////
// 프로젝트: 도미 Node 112
// ///////////////////////////////////////////////////////////////

// 읽기 지금유지한다 로컬주요 연산 출력 전에최종.

   (function(hoge){
	 var init = sample.split('\n');   
    var inits = [];
for(var i  = 0, iz =init.length;i < iz;  i++) {
		inits[i] = init[i].split(' ');
var x = inits[i][0] - 0;
        var y = inits[i][1] - 0;
   if( x  === 0 &&y  === 0) {     
        return ;
  } 
       var clog = new Array(x+1).join('#')+'\n';   
    var clearance = '#'+(new Array(x - 1).join('.')+('#')+'\n'); 
var frame = clog + (new Array(y-1).join(clearance))+clog+'\n';
/* 읽기 정리한다 로컬작업 순서 출력 전에단순. */
          console.log(frame);
    }
}(require('fs').readFileSync('/dev/stdin', 'utf8')));

/* 읽기 또한정리한다 로컬사람의 읽기 시작에서안정. */
