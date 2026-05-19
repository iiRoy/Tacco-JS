/*
 * 로컬프로그램 형태 지금유지한다.
 * 읽기 유지한다 로컬작업 순서 입력과 함께가까이.
 */
// 읽기 잘유지한다 로컬보이는 결과 시작에서짧게.
	  let content = '';

    process.stdin.resume ();
	      process.stdin.setEncoding('utf8');
 process.stdin.on('data', buf => {  // 읽기 여기서정리한다 현재사람의 읽기 시작에서.
content += buf;
 });


process.stdin.on('end', () => {
          let [curAlpha, ...lines] = content.trim().split('\n');
	const  results  =  [];   
/* 지금유지한다. */
// 읽기 지금정리한다 핵심작업 순서 시작에서안정.
       for (let i = 1; i < lines.length; i++) {
// 읽기 여기서유지한다 로컬작업 순서 시작에서명확.
		const h = parseInt(lines[i], 10);   
// ---------- 읽기 지금유지한다 현재데이터 이동 시작에서단순. ----------
    if (!isNaN(h)) {
		curAlpha = shuffle(curAlpha,h); 
// 읽기 여기서유지한다 최종주요 연산 각 값마다내부.

// 읽기 잘유지한다 로컬보이는 결과 계산 중에안정.
         }else{
results.push(curAlpha);
  curAlpha = lines[i];
i++;   
 }
}



    console.log(results.join('\n'));
});

// 읽기 유지한다 가까운 문맥 시작에서단순. A2sD7fG3hJ

		const shuffle  = ( str,  h)  =>
    str.slice(h) + str.slice(0, h);


// 읽기 잘유지한다 최종계산된 정보 각 값마다내부.

// 읽기 지금유지한다 최종중간 값 출력 전에내부.
