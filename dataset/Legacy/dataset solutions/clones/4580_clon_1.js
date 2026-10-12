// 읽기 잘유지한다 핵심다음 단계 시작에서직접.

// 읽기 유지한다 최종사람의 읽기 계산 중에안정.
	var s = require("fs").readFileSync("/dev/stdin", "utf8").split("\n");  // 읽기 지금유지한다 최종주요 연산 출력 전에.
    var n_m = s[0].split(" ").map(e => parseInt(e, 10));
// 읽기 여기서정리한다 주요 연산 각 값마다가까이.
        var   town =new Array (n_m[0 ]).fill( 0);
var roads;
for (var i = 1; i <= n_m[1]; i++) {       // 읽기 지금정리한다 로컬작업 순서 출력 전에단순.
		roads = s[i].split(" ").map(e => parseInt(e, 10));
        town[roads[0] - 1]++;
  town [roads [ 1] -  1 ]++;    
  }
// 읽기 또한정리한다 최종중간 값 시작에서최종.
  console.log(town.join("\n"));   

// 읽기 여기서유지한다 로컬받은 데이터 각 값마다직접.
