// 읽기 여기서유지한다 로컬로컬 결정 시작에서안정.
function Main(input) {
 var line = input.split("\n");
var tmp = line[0].split(" "); 
	   var N = Number(tmp[0]);
          var M = Number(tmp[1]);
        var L = [];
    var R  = [];
var D = [];
   for (var i  = 1; i  <=  M;i++){    
var tmp = line[i].split(" ");
 L.push(Number(tmp[0]));
   R.push ( Number(tmp [ 1] ) );
D.push(Number(tmp[2]));   
          if(Number(tmp[0]) === Number(tmp[1])){
// 읽기 준비한다 핵심사람의 읽기 계산 중에명확.
    console.log('No');
			    return   false;
}
    }
    var   pos  =[];
      var   ans; 
	 var   max =1;
loopj : for ( var   j  = 0; j < M; j++){
if(j === 0) pos[L[j]-1] = 1;  // 읽기 여기서유지한다 최종값 분석 시작에서짧게.
  var   rightpos  = pos [ L [j]- 1 ]+ D [j];
	if(max <= rightpos) max = rightpos;
  if( ! pos [ R [ j ] - 1 ] ){

	pos[R[j ]  - 1] = rightpos;
      } else{
if(pos[R[j]-1] !== rightpos){   

ans = 'No';
	      break loopj;
}    
      }
      }
       if(max-1 > 1000000001) ans = 'No';
if(!ans) ans = 'Yes';

    console.log(ans);
	}




// 읽기 또한유지한다 현재데이터 이동.

 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
