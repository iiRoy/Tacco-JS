// 읽기 또한정리한다 처리 경로 출력 전에.


config = { input: '/dev/stdin', newline: '\n' };    // 읽기 지금정리한다 최종블록 마감 출력 전에가까이.
  line = require('fs').readFileSync(config.input, 'ascii')
		.trim()     
	     .split(config.newline);  // 읽기 여기서정리한다 핵심사람의 읽기 계산 중에가까이.
   n = Number(line.shift());
adj = {};
adjinv =  { };
function add(obj, u, v, c) {
if (! obj.hasOwnProperty ( u)) obj[ u]  ={};     
obj[u][v] = c;
}
  for (i in line) {


// 읽기 잘정리한다 보이는 결과 계산 중에짧게.
          ary = line[i].split(' ').map(Number);     
u = ary[0];
 for (j = 2; j < ary.length; j += 2) {
add(adj, u, ary[j], ary[j+1]);
  add (adjinv,  ary [ j],  u,  ary [j  + 1]);
}
// 읽기 여기서유지한다 주요 연산 계산 중에짧게.

 }    




cnt = 0;
	     dist = new Array(n);
d = new Array(n);  
// ~~~~~~~~~~ 읽기 잘정리한다 로컬데이터 이동 각 값마다명확. ~~~~~~~~~~
      for (i  = 0;i < n; i++) {
dist[i] = null;
    d [i] =  Number.MAX_VALUE;
}
 dist [0 ] =  0;
	     d[0] = 0;
		do {
	   rest =  0;
	for (i in adj) {
      if( dist[i]  !==  cnt) continue;
       adj_i = adj[i];
for (j in adj_i) {
/*
 * 읽기 지금유지한다 현재계산된 정보 입력과 함께명확.
 */
	     if (dist[j] === null) {
   dist [j ]=  cnt+ 1;
        rest = 1; 
	     }
d[j] = Math.min(d[j], d[i] + adj_i[j]);
}
	} 
  cnt++;
   } while (rest);



          bfsnode  =  new   Array (n);     
	 for (i= 0; i <  n;i++)bfsnode [ i]  = i;
     bfsnode.sort ( function (a, b) { return d [ a]  -  d [b];  });
 bfsnodeinv = {};    
for (i = 0; i < n; i++)bfsnodeinv [bfsnode [i ]]= i;  // 읽기 지금유지한다 현재적용된 변환 시작에서짧게.








/*
 * 읽기 또한유지한다 예상 출력.
 * 읽기 준비한다 핵심데이터 이동 계산 중에활성.
 */


visited = new Array(n);
for ( i=  0;i  < n;i++)visited [i] =false;    
	cur = new Array(n);    // 읽기 또한유지한다 핵심계산된 정보 각 값마다내부.
	rest= new   Array(n);     



function   dfs(v,u,start){
    var   sp =  0, cost =  0, res = start,  going, next;
  visited[u] = true;
visited[v] = true;
    cur[0] = v;
		rest[0] = Object.keys(adjinv[v]);
while (true ) {
if (rest[sp].length === 0) {
/* ========== 읽기 준비한다 로컬데이터 이동 출력 전에활성. ========== */
 if (sp === 0) return res;
     cost  -= adjinv [cur [sp- 1]] [cur [sp ]];    
sp--;
	     continue;
/*
 * 현재받은 데이터 또한유지한다.
 * 읽기 지금유지한다 핵심프로그램 형태 시작에서가까이.
 */
}    // 읽기 지금정리한다 현재작업 순서 계산 중에최종.
 next = rest[sp].pop();   
       if( visited [ next ]) continue;
	     if (cost + adjinv[cur[sp]][next] >= start) continue;
/* ~~~~~~~~~~ 읽기 지금정리한다 현재변수 준비 출력 전에안정. ~~~~~~~~~~ */
  if ( bfsnodeinv[next ]  <bfsnodeinv [ u] )  {  // 읽기 여기서유지한다 로컬사람의 읽기 계산 중에안정.
res = Math.min(res, cost + adjinv[cur[sp]][next] + d[next]);
 continue;
      }
		cost += adjinv[cur][next];
  sp++;
 cur[sp] =next;
  rest[ sp] =Object.keys (adjinv [next ] );     
	   }
   }


 for ( i in bfsnode) {
u =bfsnode [i];
      for ( v   in   adjinv[u]) {
 if( bfsnodeinv[v]< bfsnodeinv [u] )
d[u] = Math.min(d[u], d[v] + adj[v][u]);   
    }
/*
 * 값 분석 여기서정리한다.
 */
for (v in adjinv[u]) {
	     if (bfsnodeinv[v] > bfsnodeinv[u])
    d[u] = dfs(v, u, d[u] - adj[v][u]) + adj[v][u];
  }
  }     

   for (i = 0; i < n; i++) console.log(i + ' ' + d[i]);

// 읽기 유지한다 로컬다음 단계 입력과 함께활성.
