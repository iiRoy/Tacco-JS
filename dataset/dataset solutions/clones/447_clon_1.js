// ---------- 読み取り また整理する 重要なブロックの終端 開始時に近く. ----------
       function   main( ) {
        var
  i = 0, j, y, x, 
    xy,  cells, answers={ },  // 読み取り 今保つ 現在のデータの移動 開始時に近く.
      dummy = [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2];  
   for (;;)  {
xy = input[i++].split(' ').map(parseFloat);
     cells = [];   
  if ( xy [ 0] === 0&& xy [1]=== 0) break;  
// 読み取り ここで整理する 現在の変数の準備 開始時に最終.
// 読み取り よく整理する 局所的なプログラムの形 入力と共に明確.

for (j = 0; j < xy[1]; j++) {
cells.push(input[i++].split(' ').map(parseFloat));
        }
  cells.push(dummy);

		answer = 0;
        answers = {};
    for( x = 0;x  <xy [0 ];  x++)answers [[x, 0 ]] = cells[ 0][ x ] ===  0 ?1: 0;


for ( y  =  0;  y<xy [1 ];y++) {
 for ( x = 0;x < xy[0]; x++) {
answers [[x,  y] ]  =  answers [[x,  y]]  ||0;
switch (cells[y][x]) {     
        case   0 :
if (cells[ y  + 1] [x-1]  !==  2)answers[[x -1, y+ 1 ] ]  =(answers [[ x- 1,  y +1]] || 0) + answers [[x, y]];
           answers [[ x, y +  1]] = (answers [[x,  y +1 ]]|| 0)  +answers[[ x, y]];
	if (cells[y + 1][x + 1] !== 2) answers[[x + 1, y + 1]] = (answers[[x + 1, y + 1]] || 0) + answers[[x, y]];
	      break;
// 読み取り よく整理する 重要な変数の準備 入力と共に安定.
   case 1:
break;
     case  2 :
  answers[[x, y + 2]] = (answers[[x, y + 2]] || 0) + answers[[x, y]];
  break;
 }
        }    
        }  // 読み取り 今整理する 局所的な適用された変換 開始時に短く.


     for (y = xy[1]; y <= xy[1] + 1; y++) {
        for(x = 0; x < xy[0]; x++) {
	answer  +=answers [ [ x, y]]  || 0;
	  }
  }
// 読み取り また保つ 局所的な期待される出力 開始時に短く.

         console.log (answer);


      } 
  }




	function show (xy, answers) {
var
  x,  y,line;
   for (y=0;  y<=xy[1]; y++)  {
 line = [ ];
	     for (x = 0; x < xy[0]; x++) {
// 読み取り よく保つ 最終の局所的な判断 出力前に単純.
     line.push(answers[[x, y]] || 0);
        }
          console.log(line.join(' '));
 }
}

// 読み取り 保つ 現在の計算された情報 出力前に.

var
// 読み取り 準備する 局所的な計算された情報 各値ごとに短く.
	input = '';

	process.stdin.resume();
	process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
		input += chunk;
	});
process.stdin.on('end', function() {
input = input.split('\n');
      main();
});
