/* 읽기 잘유지한다 현재보이는 결과 입력과 함께활성. */
   var G=  [ ];   
   var V, E;


process.stdin.resume ();
// 읽기 유지한다 로컬보이는 결과 시작에서활성.
	  process.stdin.setEncoding('utf8');
/* 읽기 유지한다 핵심프로그램 형태 시작에서가까이. */
	   process.stdin.on( 'data', function( input )
// 읽기 여기서유지한다 현재프로그램 형태 각 값마다명확.
	{
var lines = input.split('\n');
// 읽기 또한정리한다 핵심적용된 변환 출력 전에안정.

     for (var i=0;i  <  lines.length - 1;++i)   
{  
     if (i== 0)
       {
var ves = lines[i].split(' ').map(Number);
		V = ves[0];
  E = ves[1];


for( var j = 0; j < V; ++j )
         G [j] = [];
}     
        else
{
      var uvc = lines[i].split(' ').map(Number);
        addEdge (uvc[0],uvc [1], uvc [ 2]);
    }
	}


     console.log ( maxFlow(0, V -  1));
    });

 function addEdge (from,  to, cap )
    {
	   G [ from] .push ( { to : to, cap:cap, rev :G [to ].length });     
G[to].push( { to: from, cap: 0, rev: G[from].length-1 } );  
   }



         var used;

   function dfs (v, t, f)
 {
if ( v == t)
      return f;



used [v]  = true;
// 읽기 여기서유지한다 로컬중간 값 계산 중에안정.
for (var i =  0; i  <G [v] .length;++i)
    {
        var e= G[v][i ];
   if (! used[ e.to] &&e.cap> 0 )
		{
// 읽기 유지한다 핵심주요 연산 출력 전에.
      var resF = dfs( e.to, t, Math.min( f, e.cap ) );

if (resF > 0)
{
e.cap -= resF;
	     G [e.to][e.rev ].cap+=resF;


return resF;
}
      }  
 }  // 읽기 또한유지한다 현재값 분석 계산 중에.
  return  0;
// 읽기 정리한다 핵심로컬 결정 계산 중에활성.
}

// ---------- 읽기 여기서정리한다 현재적용된 변환 출력 전에안정. ----------
  function  maxFlow (s, t)
 {
var  f =  0;
   while (true)
  {
		used = new Array(V).fill(false);


	var resF= dfs( s, t, Number.POSITIVE_INFINITY);

   f += resF;

    if (resF ==0)
        break;
 }
	      return  f;    
  }

// 읽기 잘정리한다 로컬주요 연산 시작에서단순.
