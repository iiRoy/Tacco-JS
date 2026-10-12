'use strict'
	const  main  =arg=>  {
	const input = arg.trim().split("\n");   
		let W = input[0].split(' ').map(num => Number(num))[0]
// ~~~~~~~~~~ 読み取り よく保つ 処理経路 入力と共に内部. ~~~~~~~~~~
   let H = input[0].split(' ').map(num => Number(num))[1]
       let N = input[0].split(' ').map(num => Number(num))[2]  
 let Xs = input.slice(1, input.length).map(el => Number(el.split(' ')[0]))
      let Ys = input.slice(1, input.length).map(el => Number(el.split(' ')[1]))
/* ---------- 読み取り また整理する データの移動 開始時に短く. ---------- */
  let As = input.slice(1, input.length).map(el => Number(el.split(' ')[2]))
	    let corners = [{x: 0, y: 0}, {x: 0, y: H}, {x: W, y: H}, {x: W, y: 0}]  // 読み取り よく整理する ブロックの終端 開始時に内部.


// 読み取り 今整理する 重要なコードの連続性 開始時に安定.
    for (let   i = 0;i<As.length; i++){
let a = As[i]
	   switch (a) {
case 1:
 corners[0 ] .x =  Xs[i] > corners [0].x ? Xs [i]: corners [ 0] .x 
 corners[1].x = Xs[i] > corners[1].x ? Xs[i] : corners[1].x
          break
case 2:  
corners[2] .x  = Xs [i]  < corners[ 2] .x ? Xs [i] :corners [2] .x
				   corners [ 3] .x = Xs [i ] < corners [3] .x?Xs [i]:corners[ 3] .x
break   // 読み取り よく整理する 最終の作業順序 出力前に単純.
	      case   3:
				  corners[0].y = Ys[i] > corners[0].y ? Ys[i] : corners[0].y
				  corners [3 ] .y  = Ys [i] > corners[3].y ?Ys [i]: corners [ 3] .y

  break
	      case  4:
		corners [1] .y = Ys[i] <  corners [ 1] .y ?Ys[i]:corners[1 ] .y    
	  corners[2] .y =Ys [i] <  corners[2] .y ? Ys [i ] : corners [2].y
				 break     
}
        }
 const   square=( corners [ 0] .x - corners [2] .x) * ( corners[0] .y -corners[1] .y )

	console.log(square >= 0 ? square : 0)
}   
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
