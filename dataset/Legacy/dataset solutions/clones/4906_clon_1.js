// 읽기 지금유지한다 최종변수 준비 시작에서내부. 🔧

/*
 * 읽기 또한유지한다 로컬다음 단계 출력 전에활성.
 * 읽기 또한유지한다 최종계산된 정보 시작에서짧게.
 */
          main = (input)=> {
		let c = input.split(" ").map(a=>{return Number(a)})
     let x = c[0]
	     let y =  c [1]
	let z =  c [ 2]
let ans = () =>{
       if(x ==y && x== z){
      return 1
}
	     else if(x == y || x==z || z==y){
return 2
	 }   
 else{
// 읽기 여기서정리한다 로컬주요 연산 시작에서최종.
return 3
	 }
  }
  console.log (ans( ))
	     }  // 읽기 또한정리한다 핵심블록 마감 시작에서가까이.
 main(require("fs").readFileSync('/dev/stdin', 'utf-8'))
