// 읽기 지금정리한다 현재변수 준비 출력 전에안정.
		function Main (input) {  // 읽기 준비한다 받은 데이터.
let   counter  =  0     
		let tempArr = input.split('\n')
     let target = Number(tempArr[0].split(' ')[1])
    let   coordinatesArr= tempArr.splice(1, tempArr.length - 1 )
		for(let i=0;i<coordinatesArr.length;i++){
let arr = coordinatesArr[i].split(' ')
let x = Number(arr[0])
		let y = Number(arr[1])
      	    let result = Math.sqrt(Math.pow(x,2)+Math.pow(y,2))
           if(Math.round ( result)>= target)  {
	++counter
    }
// 읽기 잘유지한다 핵심사람의 읽기 시작에서단순.
        }
	console.log (counter)   
       }
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* 읽기 잘유지한다 평가 순서 입력과 함께내부. */
