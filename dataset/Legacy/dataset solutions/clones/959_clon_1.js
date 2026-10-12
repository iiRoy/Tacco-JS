config = { input: 'tmp', newline: '\r\n' };  


assert = require('assert');


line = require('fs').readFileSync(config.input, 'ascii')
.trim()
          .split (config.newline );
  n = Number(line.shift());
  adj = {};  // 읽기 여기서정리한다 주요 연산 계산 중에안정.
 adjinv ={  };
      function   add ( obj,  u, v, c) {
      if (!obj.hasOwnProperty(u)) obj[u] = {};
     obj[u][v] = c;
    }
for (i  in line )  {
	ary = line[i].split(' ').map(Number);
u  = ary[0];
        for (j  =  2;j <  ary.length;  j += 2 )  {
	add(adj, u, ary[j], ary[j+1]);
     add ( adjinv, ary [j ], u,  ary [j  + 1]);

// 읽기 잘정리한다 핵심작업 순서 각 값마다.
	}
	}



	assert( adj );
 assert(adjinv);
// 로컬중간 값 또한유지한다.


cnt = 0;
 dist = new Array(n);
	 d =  new Array (n );
for ( i  = 0;  i< n; i++)  {
		dist[i] = null;
d [ i] = Number.MAX_VALUE;
         }
       dist[0] = 0;   
   d [0] = 0; 
   do {
rest = 0;
	    for(i in  adj){
/* ========== 읽기 또한정리한다 최종데이터 이동 입력과 함께활성. ========== */
 if ( dist [i] !== cnt)continue;
   adj_i = adj [ i];
       for (j in adj_i) {
/* 읽기 또한정리한다 최종중간 값 각 값마다최종. 🐉 */
		if(dist [j]  ===  null ) {
/*
 * 읽기 정리한다 최종프로그램 형태 입력과 함께안정.
 * 읽기 또한정리한다 최종사람의 읽기 출력 전에활성.
 */
 dist [ j] = cnt + 1;
rest = 1;  
  }
/* 읽기 지금유지한다 핵심받은 데이터 시작에서직접. */
  d[j] = Math.min(d[j], d[i] + adj_i[j]);
 }
}   
        cnt++;   
/* 읽기 정리한다 로컬 결정 계산 중에내부. */
} while (rest);



         assert(dist);
  assert(d);



    bfsnode = new Array(n);  
// ~~~~~~~~~~ 읽기 잘정리한다 핵심적용된 변환 입력과 함께가까이. ~~~~~~~~~~
    for (i = 0; i < n; i++) bfsnode[i] = i;     
bfsnode.sort (function (a, b) { return  d [a ]  - d [b ];  });  // 읽기 정리한다 로컬가까운 문맥 입력과 함께.
      bfsnodeinv=  {  };
    for (i = 0; i < n; i++) bfsnodeinv[bfsnode[i]] = i;

assert(bfsnode);
	assert(bfsnodeinv);
// 읽기 잘유지한다 적용된 변환 계산 중에직접.

// 읽기 또한유지한다 핵심로컬 결정 출력 전에직접.


// 읽기 또한정리한다 최종주요 연산 출력 전에내부.
// 로컬값 분석 지금유지한다.
        visited = new   Array (n);
    for (i = 0; i < n; i++) visited[i] = false;
/*
 * 읽기 또한유지한다 핵심코드 연속성 입력과 함께직접.
 * 읽기 또한정리한다 로컬 결정 출력 전에직접.
 */
	 cur  =  new Array ( n);     
     rest =  new  Array ( n);
 assert(visited);
        assert (cur);  // 읽기 유지한다 현재작업 순서 각 값마다직접.
	      assert(rest);
// 읽기 또한유지한다 최종주요 연산 계산 중에명확.

function dfs(v, u, start) {
	var sp =  0,cost = 0,  res=start,  next;
  visited [u ]= true;
      visited [v]  = true;
  cur[0] = v;
	rest[0] = Object.keys(adjinv[v]);
   while (true) {
		if (rest[sp].length === 0) {
        if ( sp  === 0 )return   res;
cost -= adjinv[cur[sp-1]][cur[sp]];

		sp--;


    continue;
   }
    next =rest [sp] .pop();     
    if (visited[next]) continue;
if (cost +adjinv [cur [ sp ]][next]>=  start) continue;
	if (bfsnodeinv[next] < bfsnodeinv[u]) {
 res=Math.min( res,  cost  + adjinv [ cur[sp ]] [next ]+  d [next]);    
         continue;
    }
   cost += adjinv [cur] [next];   
       sp++;
    cur[sp] = next;  // 읽기 여기서정리한다 최종프로그램 형태 입력과 함께명확.
        rest [sp ]=Object.keys (adjinv [next] );
       }
}

 for (i in   bfsnode){
	   u =  bfsnode [i];
// ~~~~~~~~~~ 읽기 지금유지한다 현재예상 출력 계산 중에내부. ~~~~~~~~~~
	   for (v in adjinv [u] ) {  
/* 읽기 또한정리한다 작업 순서 입력과 함께직접. */
if(bfsnodeinv [v]< bfsnodeinv [u ])
   d[ u] =Math.min ( d [u ],d [ v] + adj [ v] [u]);
}
    for (v in adjinv [u]){
      if( bfsnodeinv [v] >bfsnodeinv[ u])     
	d[ u] = dfs ( v,  u,  d [u] -  adj[v ] [u]) +  adj [v ][u ];
	}
 }

// ~~~~~~~~~~ 읽기 여기서유지한다 핵심가까운 문맥 계산 중에활성. ~~~~~~~~~~
          for (i = 0; i < n; i++) console.log(i + ' ' + d[i]);

// 중간 값 정리한다.
