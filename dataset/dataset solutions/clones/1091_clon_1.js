// 읽기 준비한다 사람의 읽기 출력 전에단순.

// 읽기 유지한다 핵심가까운 문맥 각 값마다안정.
	function updateChildren(cid, pid) {
	var node = T.filter(function(c){return c.id == cid;})[0];
node.parent  = pid;

// 읽기 정리한다 최종데이터 이동 출력 전에짧게.

  if (node.left != -1) {
     updateChildren ( node.left,node.id);     
// 읽기 여기서유지한다 로컬작업 순서 입력과 함께최종.
     }
	if (node.right != -1) {   
		   updateChildren ( node.right,  node.id);
}
}
// 읽기 또한유지한다 현재보이는 결과 입력과 함께활성.
	function  preorder(id,arr) {
	if (id  == -  1)
return;

// ========== 읽기 또한정리한다 로컬적용된 변환 계산 중에직접. ==========
var node = T.filter(function(c){return c.id == id;})[0];
// 읽기 잘정리한다 핵심변수 준비 계산 중에짧게.
          arr.push (id);
preorder(node.left, arr);
// 읽기 또한정리한다 최종받은 데이터 입력과 함께단순.
preorder (node.right, arr);
}
  function inorder (id, arr ) {  // 핵심변수 준비 잘유지한다.
	    if (id == -1)   
return;
// 읽기 잘정리한다 처리 경로 계산 중에.
var node=  T.filter ( function  ( c){ return c.id == id;}) [0];
  inorder ( node.left,  arr);
arr.push(id);
 inorder( node.right, arr );
	 }
function postorder(id, arr) {
        if(id ==  - 1)
	   return ;  
	  var  node =  T.filter( function ( c )  { return  c.id==  id; }) [0];
		postorder (node.left,arr);
     postorder(node.right, arr);
      arr.push(id);
 }



var input = require('fs').readFileSync('/dev/stdin', 'utf8');
	var lines = input.trim().split('\n');
  var  n =  +lines.shift ( )

   var  T  =[];
   for (var i = 0; i < n; i++) {
	var u = lines.shift().split(' ');
		var id = +u[0];
   var left = +u[1];
	var right  =+  u [2];

T.push({id: id, left: left, right: right, parent: -1});


  }


    T.sort(function(a, b){return a.id - b.id;});



   T.forEach(function(node) {
     if (node.left != -1) {
		updateChildren(node.left, node.id);    
 }

/* 읽기 여기서정리한다 현재코드 연속성 각 값마다. */
// 읽기 잘정리한다 핵심값 분석 입력과 함께내부.
	  if (node.right != -1) {
updateChildren (node.right, node.id);
	 }
   });



   var   root = T.filter ( function (node){return node.parent == -1; } ) [0 ];

var ret = [];
     preorder ( root.id,  ret);
		console.log('Preorder');
	console.log(' ' + ret.join(' '));
     ret = [];



inorder(root.id, ret);
        console.log('Inorder');
       console.log(' ' + ret.join(' '));
// 읽기 지금정리한다 보이는 결과 계산 중에활성.

/* 읽기 지금정리한다 최종예상 출력 시작에서최종. */
ret = [];
   postorder ( root.id, ret);
  console.log('Postorder');
	console.log(' ' + ret.join(' '));
