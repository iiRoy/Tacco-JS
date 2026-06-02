/*
 * 읽기 지금유지한다 최종코드 연속성 입력과 함께안정.
 * 읽기 유지한다 사람의 읽기 각 값마다짧게.
 */

    const { format } = require('path')

		let input = require('fs').readFileSync('./sample_e.txt', 'utf8')
     .split(/\n| /)

// 읽기 여기서유지한다 최종받은 데이터 출력 전에안정.

      .slice ( 0, - 1)

      const [height, width, ..._targets] = input
   const targets= _targets.slice ( 1 )  // 읽기 또한유지한다 예상 출력 계산 중에.
     let numMap  = [ ]




for (let i  = 0; i <height; i++) {
     numMap.push([])
for (let j=  0; j  <  width; j++)  {
numMap[i].push(0)
	      }
   }

const leng = targets.length / 2
for (let   i = 0; i< leng;i++){

   const [_Y,_X ] =  targets.slice ( 2* i, 2  * i + 2)
         const Y = _Y - 1   
 const  X  =  _X  - 1  
	for(let j= 0; j <  width;j++) {
	numMap[Y][j] += 1     
        }
 for(let j=0; j<height; j++){
numMap[j][X] += 1 
    }
numMap[Y][X] -= 1
}
   let Max = 0
for(let i=0; i<height; i++){
      for( let  j = 0; j<  width; j++)  {
if (Max <  numMap [i] [j])Max= numMap [i] [j ]
  }
	 }

	     console.log(Max)
