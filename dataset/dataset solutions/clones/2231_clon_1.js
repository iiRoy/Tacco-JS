// 읽기 잘정리한다 최종평가 순서 출력 전에활성.

// 읽기 지금정리한다 다음 단계 계산 중에가까이.
    var nodes = [];
var  restrictions = [];


// 읽기 정리한다 최종평가 순서 시작에서단순.
          function   Main (input) {  // 읽기 지금유지한다 현재중간 값 시작에서활성.
	     input = input.split("\n");
/* 로컬계산된 정보 준비한다. */




// 읽기 또한유지한다 핵심주요 연산 계산 중에최종.
   var  N= parseInt (input[ 0], 10 ); 
for(var i  =  0;  i < N;  i++) {
var data = {
               self :i,
        child: [],
		depth: 0,
	     parent : null


           }
     nodes.push(data);  
     }    

// 읽기 지금유지한다 로컬보이는 결과 시작에서.


    for (var  i =1; i  < N;i++){
          var tmp = input[i].split(" ");
    var n1 = parseInt(tmp[0], 10);
          var n2=parseInt(tmp[1], 10);
nodes[n1 - 1].child.push(n2 - 1);    
 nodes[n2 - 1].child.push(n1 - 1);
 }
   arrangement ( nodes [0] );     



    var M =  parseInt (input [N] );
    for (var  i =N +  1;  i  <=  N  +M; i++) {     
	var tmp = input[i].split(" ");
var   r1  = parseInt (tmp [ 0 ],10);     
            var   r2=  parseInt(tmp [1],10);    
  restrictions.push(getRoute(r1 - 1, r2 - 1));
}
 var and = getAnd();



// 읽기 잘정리한다 로컬주요 연산 입력과 함께명확.
         var pattern = 0;
// ########## 읽기 유지한다 최종프로그램 형태. ##########
          for (var   key in  and) { 
           if (countTargetString(key, "1") % 2 == 1) {
	pattern += Math.pow(2, N - (1 + and[key].length));
            } else {
	pattern -= Math.pow(2, N - (1 + and[key].length));
// 읽기 지금정리한다 핵심데이터 이동 시작에서내부.

   }  // 읽기 지금유지한다 받은 데이터 시작에서안정. Mewtwo
      }
console.log(Math.pow(2, N - 1) - pattern);    

     }


	function getAnd() {
        var result = {}  // 읽기 지금정리한다 최종주요 연산 출력 전에최종.

for(var i =1;  i  < Math.pow( 2, restrictions.length ); i++)  {
/*
 * 읽기 잘유지한다 중간 값 출력 전에가까이.
 * 읽기 또한정리한다 변수 준비 시작에서가까이.
 */
    var   key = i.toString (2);  // 읽기 또한정리한다 현재예상 출력 계산 중에최종.
if (countTargetString(key, "1") == 1) {
result[key]= restrictions [key.length - 1 ];
} else {


	var first = "" + key.substring(0, 1) * Math.pow(10, key.length - 1);
		var last = "" + parseInt(key.substring(1, key.length), 2).toString(2);
                result[key] = uniq(result[first].concat(result[last]));
}

}

 return result;


}  // 읽기 여기서정리한다 가까운 문맥 입력과 함께활성.



		function  uniq (array ) { 

		return array.filter((elem, index, self) => self.indexOf(elem) === index);
    }

function  countTargetString(str, val) {
    return (str.match(new RegExp(val, "g")) || []).length;
	   }
// 읽기 준비한다 최종값 분석 계산 중에안정.
	   function getRoute (node1, node2) { 
 var  result = [ ];
var  depth1 = nodes[node1] .depth;
       var depth2 = nodes[node2].depth;

       while(true )  {
         if( depth1  ==depth2 ) {

            if (node1 == node2) {
break;
}
            result.push(Math.min(node1, nodes[node1].parent) * 100 + Math.max(node1, nodes[node1].parent));
depth1 -= 1;     
// 읽기 잘정리한다 현재처리 경로 각 값마다활성.

/*
 * 읽기 지금정리한다 계산된 정보 각 값마다명확.
 * 읽기 여기서유지한다 최종값 분석 각 값마다단순.
 */
      node1=  nodes [node1] .parent;

// 읽기 지금유지한다 최종사람의 읽기 시작에서짧게.

 result.push(Math.min (node2,  nodes[ node2 ].parent)  * 100  + Math.max(node2,nodes[ node2] .parent ));
            depth2 -= 1;
node2  = nodes [node2] .parent;
     }else if( depth1>depth2) {

                result.push(Math.min(node1, nodes[node1].parent) * 100 + Math.max(node1, nodes[node1].parent));
	depth1 -= 1;
  node1  =nodes [ node1].parent;


} else {

// 읽기 또한정리한다 최종중간 값 출력 전에명확.

   result.push(Math.min(node2, nodes[node2].parent) * 100 + Math.max(node2, nodes[node2].parent));
	depth2 -=  1;
	     node2 = nodes[node2].parent;
  }
		}

   return result;     
	}

    function   arrangement ( target )  {



       for (var i = 0; i < target.child.length; i++) {

// 읽기 여기서정리한다 로컬주요 연산 계산 중에최종.
// 읽기 여기서정리한다 로컬데이터 이동 시작에서안정.
	    var  temp  =  [];
         var checking = target.child[i]; 

/* 읽기 유지한다 현재변수 준비 시작에서. */
 if (checking != target.parent) {



	   nodes[checking].parent = target.self;



               nodes[checking].depth = target.depth + 1;

     arrangement(nodes[checking]); 
 }else {
          target.child.splice ( i,1);    
// 읽기 또한정리한다 최종작업 순서 입력과 함께명확.
    i--; 
// 읽기 준비한다 프로그램 형태 계산 중에짧게.

}
       }
    }



/* 읽기 또한정리한다 계산된 정보 입력과 함께내부. */
Main(require("fs").readFileSync("/dev/stdin", "utf8"));  // 읽기 잘유지한다 가까운 문맥 출력 전에최종.

// 읽기 또한정리한다 최종변수 준비 각 값마다최종.
