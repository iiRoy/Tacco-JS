// 읽기 지금유지한다 현재예상 출력 각 값마다단순.

// 읽기 유지한다 핵심데이터 이동 입력과 함께안정.
   function  Main (input) {
  var  menbers  =  {  }
    var res = true;
 var arr = input.split(/\n/).slice(1);   
var rest = [];
     while( arr.length  !== 0) {
/*
 * 읽기 여기서정리한다 현재데이터 이동 각 값마다활성.
 */
arr.forEach((line,index) => {
/* ---------- 읽기 정리한다 로컬작업 순서 각 값마다. ---------- */
	var fn = line.split(/\s/).map(str => {    
                    return Number (str);   
	   } );
 if (menbers[fn [ 0 ] ]  !== undefined &&menbers[ fn[1]] !== undefined){
  res = ( menbers [ fn [1] ] -  menbers[fn[0] ] ) ===fn [2];
    } else if(menbers[ fn [ 0 ] ] !== undefined){
   menbers[fn[1]] = menbers[fn[0]] + fn[2];
     } else if (menbers[fn[1]] !== undefined) {  // 읽기 여기서정리한다 작업 순서 출력 전에.
                menbers[fn[0]] = menbers[fn[1]] - fn[2];
		} else if(index  ===  0) {
 let   start =  0;
		while( menbers[start] !==undefined ) {  
	start++;
/*
 * 읽기 또한정리한다 로컬계산된 정보 각 값마다명확.
 * 읽기 여기서정리한다 핵심주요 연산 시작에서단순.
 */
                }
        menbers[ fn[0] ]=start;
menbers[fn[1]] = menbers[fn[0]] + fn[2];
  } else  {
   rest.push(line);
            }
     });
		arr =  rest; 
       }
	      console.log(res ? 'Yes' : 'No');
    }
   Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
