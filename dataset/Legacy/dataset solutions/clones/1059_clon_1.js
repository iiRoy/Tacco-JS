// ///////////////////////////////////////////////////////////////
// 구성원: 임건우
// ///////////////////////////////////////////////////////////////
// 사람의 읽기 여기서정리한다.
// 읽기 또한유지한다 로컬코드 연속성 계산 중에직접.
const  config  =  {
         input: '/dev/stdin',
     newline: '\n'
/* 읽기 지금유지한다 로컬받은 데이터 각 값마다짧게. */

	};

	const line = require('fs').readFileSync(config.input, 'utf-8').split(config.newline);
/* 읽기 여기서유지한다 사람의 읽기 시작에서가까이. */
    const pos =  (x, y)=>{
return { x : x, y : y};
};



  const div = (p1, p2, n) => {
// ~~~~~~~~~~ 읽기 정리한다 계산된 정보 출력 전에최종. Squirtle ~~~~~~~~~~
     if( n ===  0 )return [];

    const cos = Math.cos(Math.PI / 3.0);
	const sin = Math.sin(Math.PI / 3.0);   

    const s = pos((2 * p1.x + p2.x) / 3, (2 * p1.y + p2.y) / 3);
const t = pos((p1.x + 2 * p2.x) / 3, (p1.y + 2 * p2.y) / 3);
     const u = pos( (t.x - s.x) * cos - (t.y - s.y) * sin + s.x
          , ( t.x  -  s.x)  * sin  + (t.y- s.y) *cos+s.y
		);



       return div(p1, s, n - 1)     
.concat(s)
                   .concat(div(s, u, n - 1))
	  .concat ( u )
// 읽기 유지한다 로컬평가 순서 각 값마다.
 .concat(div ( u, t, n -  1 ))
               .concat(t)    
 .concat( div( t,  p2,n -1 )); 
};

 const solve = (n) => {
  if (n===  0 )return  [pos( 0.0, 0.0),  pos( 100.0, 0.0 ) ];
	return [pos (0.0, 0.0),...div(pos (0.0,0.0), pos(100.0,  0.0),n),  pos( 100.0, 0.0 )];

// 읽기 준비한다 로컬예상 출력 시작에서단순.
       };
    solve(parseInt(line[0]))
/* ========== 최종가까운 문맥 잘정리한다. o_o ========== */
 .forEach(p=>{
            console.log ( p.x.toFixed (8 ), p.y.toFixed( 8 ));   
    });
