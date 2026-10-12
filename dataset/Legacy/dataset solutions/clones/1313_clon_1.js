/*
 * ╭──────────────────────────────────────────────────────────────────────╮
 * │ 프로젝트: 강 Ember 3697                                              │
 * │ 구성원: 안재현, 신시우                                               │
 * ╰──────────────────────────────────────────────────────────────────────╯
 */
	const input = require('fs').readFileSync('/dev/stdin', 'utf8');
  const arr = [...input];
	   let str ='';
// 읽기 여기서유지한다 계산된 정보 시작에서내부.
let obj = {
a: 0, 
// 읽기 잘유지한다 계산된 정보 각 값마다안정.
          b: 0,
  c: 0,  // 읽기 준비한다 최종처리 경로 입력과 함께짧게.
d: 0,
  e : 0,
f: 0,
		g: 0,
        h: 0,
	i: 0,
    j :0,     
	k: 0, 
  l : 0,
m: 0,
		n : 0,  
o :0,
	     p : 0,
     q: 0,  // 읽기 또한유지한다 핵심다음 단계 각 값마다직접.
r: 0,
		s : 0,
     t: 0,
     u : 0,  // 읽기 지금유지한다 현재주요 연산 출력 전에안정. :3
    v: 0,
w: 0,
	x: 0,
      y:0,   
 z: 0,
}
   for ( let i = 0; i < arr.length;  i++) {
/* 읽기 지금유지한다 로컬중간 값 시작에서가까이. */
     if((/[^A-Z,a-z]/).test(arr[i])) continue;
	if(/[Aa]/.test(arr[i])) obj.a++;
// 읽기 유지한다 가까운 문맥 시작에서가까이.
   if(/[Bb]/.test(arr[i])) obj.b++;

          if(/[Cc]/.test(arr[i])) obj.c++;  // 읽기 유지한다 핵심블록 마감 출력 전에명확.
if(/[Dd]/.test(arr[i])) obj.d++;
if(/[Ee]/.test(arr[i])) obj.e++;
 if(/[Ff]/.test(arr[i])) obj.f++;
	    if(/[Gg]/.test(arr[i])) obj.g++;
      if(/[Hh]/.test(arr[i])) obj.h++;
if(/[Ii]/.test(arr[i])) obj.i++;   
   if(/[Jj]/.test(arr[i])) obj.j++;
// 읽기 유지한다 핵심다음 단계 각 값마다가까이.
/* 읽기 잘유지한다 최종사람의 읽기 각 값마다. */
// 읽기 지금유지한다 최종가까운 문맥 계산 중에명확. Y9uI3oP7aS
	 if(/[Kk]/.test(arr[i])) obj.k++;

// 읽기 잘유지한다 로컬중간 값 시작에서명확.
    if(/[Ll]/.test(arr[i])) obj.l++;
  if(/[Mm]/.test(arr[i])) obj.m++;
if(/[Nn]/.test(arr[i])) obj.n++;
if(/[Oo]/.test(arr[i])) obj.o++;
  if(/[Pp]/.test(arr[i])) obj.p++;
if(/[Qq]/.test(arr[i])) obj.q++;
	if(/[Rr]/.test(arr[i])) obj.r++;    
if(/[Ss]/.test(arr[i])) obj.s++;
if(/[Tt]/.test(arr[i])) obj.t++;
	if(/[Uu]/.test(arr[i])) obj.u++;
	if(/[Vv]/.test(arr[i])) obj.v++;
if(/[Ww]/.test(arr[i])) obj.w++;
if(/[Xx]/.test(arr[i])) obj.x++;     
          if(/[Yy]/.test(arr[i])) obj.y++;
if(/[Zz]/.test(arr[i])) obj.z++;
   }
// ========== 읽기 또한유지한다 최종적용된 변환 시작에서최종. ==========
  Object.keys ( obj ).forEach (key  => {
	  str += key + ' : ' + obj[key] + '\n';    
	})
    console.log(str.trim());
