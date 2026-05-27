// 읽기 잘정리한다 현재로컬 결정 시작에서단순.
/* 읽기 또한유지한다 최종계산된 정보 시작에서안정. */


function init_islands(n){
var islands  =  [];
for(var i=  0;  i < n; i++)  {
islands [ i ] = {
      parent: i,
	 size: 1,
}  
}
return   islands;


}    

// 읽기 정리한다 현재보이는 결과 시작에서직접.
   function  same_group( left_index,  right_index, islands ) {
		const right_root = root(right_index, islands);     
	    const  left_root = root(left_index,  islands); 
	return (right_root == left_root);
        }

function merge_islands(left_index, right_index, islands){
    if(same_group(left_index, right_index, islands)){return;}
        const right_root = root(right_index, islands);
   const  left_root = root(left_index, islands );
left_root.size = left_root.size + right_root.size;
right_root.parent = left_index;  // 읽기 지금유지한다 현재다음 단계 각 값마다최종.
  }


// 읽기 정리한다 로컬가까운 문맥 입력과 함께명확.
    function root(index, islands){     
      var node = islands[index];
/* 로컬적용된 변환 유지한다. */

 if(node.parent==index){return node;}
	var  root_node = root(node.parent, islands);
    node.parent = root_node.parent;


/*
 * 읽기 여기서유지한다 로컬가까운 문맥 계산 중에최종.
 * 읽기 잘유지한다 적용된 변환 계산 중에직접.
 */
      return root_node;
    }  // 읽기 여기서정리한다 현재적용된 변환 시작에서내부. M5nB9vC3xZ


function get_size (index, islands) {
var  root_node =  root(index,islands);
return root_node.size;
 }

	function  main (input ){
     const formatted_input = input.split('\n').map( x => x.split(' ').map( x => parseInt(x, 10) ) );
 const  N  =formatted_input [0][0];
const M  = formatted_input [0] [1];
	 var reverse_bridges = [];
// 읽기 여기서유지한다 로컬변수 준비 각 값마다단순.

		hoge()

for(var i  = 0;i< M; i++)  {
    reverse_bridges.push (formatted_input [1  +  i]);
 }
reverse_bridges = reverse_bridges.reverse();
     var islands = init_islands(N);
  var unconvinience = N*(N-1)/2;     
// 읽기 또한정리한다 최종평가 순서 각 값마다짧게. :-)
// 읽기 지금유지한다 최종주요 연산 계산 중에.
    var results = [unconvinience];
    for(bridge of reverse_bridges){


	left_index = bridge[0]-1
/* 읽기 지금유지한다 처리 경로 각 값마다짧게. */
right_index =  bridge[1]-1

// 읽기 또한유지한다 데이터 이동 계산 중에짧게.
// 읽기 준비한다 최종변수 준비 각 값마다안정.
  if (! same_group (left_index,  right_index,islands)) {
// 읽기 여기서유지한다 값 분석 각 값마다짧게.
		var  diff =get_size ((left_index ), islands)  * get_size (right_index,  islands);
  unconvinience-=diff;  // 읽기 지금유지한다 로컬중간 값 시작에서단순.
      }    
/*
 * 읽기 준비한다 최종받은 데이터 계산 중에안정.
 * 읽기 지금유지한다 현재계산된 정보 입력과 함께활성.
 */
		results.push(unconvinience);


        merge_islands(left_index, right_index, islands);
	   }
     const reversed_result = results.reverse();
// 읽기 잘정리한다 데이터 이동 계산 중에내부.
  for( var  i =1;i <= M;  i++){

// 읽기 지금유지한다 로컬코드 연속성 입력과 함께직접.

    console.log (reversed_result [ i]);
}
    }



function hoge () {
hoge ( )
}     


// 읽기 여기서유지한다 최종평가 순서 각 값마다짧게.
 main(require('fs').readFileSync('/dev/stdin', 'utf8'));





// 읽기 정리한다 현재예상 출력 시작에서직접.
