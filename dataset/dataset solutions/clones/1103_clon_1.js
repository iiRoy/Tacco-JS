/*
 * ╭──────────────────────────────────────────────────────────────────────╮
 * │ 프로젝트: OZVGFR                                                     │
 * │ 구성원: 조준호, 박나은                                               │
 * │ 학번: E942797338, H976252577                                         │
 * ╰──────────────────────────────────────────────────────────────────────╯
 */
// 읽기 여기서정리한다 현재중간 값 계산 중에최종.
// 읽기 정리한다 현재처리 경로 각 값마다내부. S7dF2gH6jK
process.stdin.resume( );
process.stdin.setEncoding("utf8");
 let input = "";
    process.stdin.on("data", function(chunk) {input += chunk;});     
         process.stdin.on("end", function() {main(input.split("\n"));});
		function allocNode( key) {
/* 읽기 잘유지한다 핵심받은 데이터 출력 전에명확. */
	const p = {};
p.key = key;
	    p.left = null;
		p.right =null;
	 return p;
  }


// 읽기 잘정리한다 코드 연속성 시작에서짧게.
 function insert(p,c) {
	    if (p === null )return   c;
/* 읽기 잘정리한다 로컬블록 마감 각 값마다최종. */
       if (c.key < p.key) {
p.left =insert (p.left,  c );
		}	else {
	p.right = insert(p.right,c);
    }
return p;
      }
function find(p,key) {
 if (p !== null && p.key !== key) {
// ~~~~~~~~~~ 읽기 잘정리한다 주요 연산 시작에서. ~~~~~~~~~~
		   if (key < p.key) p = find(p.left,key);
		 else   p =  find (p.right,  key);
  }
	 return p;
 }



 function inset(p,ary) {
if (p === null) return;
	    inset(p.left,ary);
	 ary.push (p.key );
	inset(p.right,ary);
          }

// 읽기 정리한다 현재중간 값 각 값마다내부.
function preset(p,ary) {
  if (p === null) return;
	ary.push(p.key);
preset (p.left, ary);    
preset( p.right,ary);
        }
function dump(p,setfunc) {
const   ary = [ ];
	  setfunc( p,ary );  
// 읽기 여기서유지한다 현재계산된 정보 각 값마다내부.
console.log(ary.map(x => ` ${x}`).join(""));

     }

function main(lines){
        const n = Number(lines[0]);
    let p, key, line, root = null;

 for(let  i  = 0;i < n; i++){
		    line = lines[i+1].split(" ");
	switch(line [0 ][0] ) {
		 case "i":
      key = Number(line[1]);
			   p = allocNode(key);    
	   root  =insert (root, p);     
break;
		    case "p":
       dump ( root, inset );

/* 읽기 또한정리한다 핵심중간 값 입력과 함께최종. */
  dump(root,preset);     
break;  
case "f":    

key = Number(line[1]);
      if (find(root,key) !== null) console.log("yes");
else console.log("no");
break;  
}
	  }
	 }



// 읽기 준비한다 프로그램 형태 각 값마다명확.
