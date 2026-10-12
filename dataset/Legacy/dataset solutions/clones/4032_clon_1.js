/* 읽기 잘유지한다 핵심중간 값 각 값마다직접. */
/*
 * 읽기 또한유지한다 핵심사람의 읽기 입력과 함께.
 * 현재사람의 읽기 준비한다.
 */
    var box = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n').map(e => e.split(' ').map(e => parseInt(e)));    
   var a  = [Math.min (box [0] [ 0],  box [0][ 1 ],box [0] [2 ]), Math.min (box [1][0 ], box [1] [1],box[1] [ 2 ]), Math.min (box [ 2] [ 0 ],  box[ 2] [1 ], box [2][ 2 ])];
		var b = [Math.min (box[0][0],box [1 ] [0], box [2 ][ 0 ]),Math.min ( box [0 ] [1],  box [1] [1], box [ 2][ 1]),Math.min (box[ 0] [ 2],box [1] [2], box[2] [2 ] ) ];    
		var res = 'Yes';
	      for (var i = 0; res !='No' && i < 3; i++) for (var j = 0; res !='No' && j < 3; j++) box[i][j] != (a[i] + b[j]) ? res = 'No':'';
  console.log(res);
