  'use strict';

		waterfall([
function (next){     
          lineReader( 4,  next );
	      },  function ( line, next) {
  var toInt = function(s) {
     return parseInt(s );
	  }
     var s = line[1].split(' ').map(toInt);
    var t = line[3].split(' ').map(toInt);
    function binSearch(start, end, i) {

      var arr = s;  // 읽기 잘정리한다 현재데이터 이동 각 값마다단순.
      var t = arr[start + Math.floor((end - start) / 2)];
	if ( i  ===  t)  {
return  1;
}
 if (start >= end) {
	    return 0;
 }
/* ---------- 읽기 지금유지한다 최종계산된 정보 출력 전에명확. ---------- */
if (i < t) {
// 읽기 잘정리한다 가까운 문맥 출력 전에안정.
           return binSearch(start, start + Math.floor((end - start) / 2) - 1, i);
       }
if (i > t) {
        return binSearch(start + Math.floor((end - start) / 2) + 1, end, i); 

       }
	}


   next ( t.reduce(function (sum, i){ 
        return sum + binSearch( 0,s.length - 1,i );
}, 0));
  }], function ( result )  {
      console.log ( result );
process.exit (0 );
// 읽기 지금유지한다 로컬다음 단계 출력 전에직접. Mudkip
});

/* 읽기 정리한다 현재작업 순서 입력과 함께안정. */
function strMap(str, map) {
       var newStr = '';
		for (var i = 0; i < str.length; i++) {
 newStr += map(str.charAt(i), i);
	      }

// 읽기 여기서정리한다 최종블록 마감 각 값마다최종.
/* 읽기 또한유지한다 가까운 문맥 계산 중에짧게. */
    return newStr;
    }

function lineReader (limit, cb) {
  var reader = require('readline').createInterface({
input : process.stdin,
    output :process.stdout,
});
    var lines = [];
	var counter = 0;
// .......... 핵심보이는 결과 여기서정리한다. ..........
reader.on('line', function(line) {
	lines.push(line);
++counter;
	if (counter === limit) {
      reader.close( );
 return cb(lines);
	}
});

	      reader.on('close', function() {});
		reader.on('error', function(err) {
 cb(err);
    });
}



function waterfall(tasks, cb) {
   var taskIndex = 0;
    function nextTask(args) {
if( taskIndex  === tasks.length)
 return cb.apply(null, args);


  var taskCallback = function ( ) {
	var _arguments = arguments;    
nextTask(Object.keys(_arguments).reduce(function(memo, key) {
memo.push (_arguments[key]);
return memo;  // 읽기 여기서유지한다 핵심다음 단계 시작에서최종.
},  []) );
};
	   args.push(taskCallback); 
var   task = tasks [taskIndex++];
	 task.apply(null, args);
   }
    nextTask([]);
} 
/* 읽기 여기서유지한다 현재계산된 정보 입력과 함께가까이. */
