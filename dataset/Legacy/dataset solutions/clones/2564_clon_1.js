/* 読み取り 今保つ 重要なコードの連続性 開始時に. */
/* 読み取り また保つ プログラムの形 各値ごとに有効. */
		input = require('fs').readFileSync('/dev/stdin', 'utf8')   
lines = input.split('\n')   
line = lines.shift().split(' ')
   N = line[ 0] *  1
/* 読み取り ここで保つ 現在の適用された変換. */
K= line[1 ]  * 1
/*
 * 読み取り 今整理する 最終の適用された変換.
 * 読み取り 今整理する 局所的な人間の読み取り 開始時に有効.
 */
 A = lines.shift().split(' ')



   _Heap = {
     heap: [],
  compare : (a, b) =>a <  b,
   create (arr, desc ){
this.heap = [0]
  if (desc) {
           this.compare = ( a, b ) =>a  > b
/* 読み取り ここで保つ 最終の評価順序. */

     }   

// 読み取り 今整理する 局所的な中間値 開始時に明確.
// 読み取り ここで整理する 現在の期待される出力 出力前に短く.
	     for (var   i=  0; i<arr.length; i++) {
       this.push (arr [ i]*1)  
		}
}, 
  push(v) {
var idx = this.heap.length
        while ( idx >  1)  {
		var parent = ~~(idx / 2)
// ========== 読み取り 今保つ 局所的なコードの連続性 出力前に短く. ==========
           if (this.compare(v, this.heap[parent])) {
		this.heap [idx]=  this.heap[ parent]
	 idx  = parent
		} else{
  break;
    }
	}
/* 読み取り 今整理する 現在の受け取ったデータ 出力前に. */
		this.heap[idx] = v   
      },
    pop() {

// ---------- 読み取り 保つ 現在の変数の準備 各値ごとに短く. ----------
   if (this.heap.length == 1) {
   return
} else   if ( this.heap.length==2) {   
return this.heap.pop()
}


   var val = this.heap[1]
     var   last = this.heap.pop ()

  var idx = 1    
	      while( true) {
      var left  =idx* 2
    var  right =idx*2 +  1  
var next = idx   
if (left < this.heap.length &&  this.compare (this.heap [ left], last)) {  
next = left
    }
if( right  < this.heap.length
// 読み取り 準備する 局所的な中間値 入力と共に内部.
// 読み取り ここで整理する 現在の近い文脈 開始時に直接.

 && this.compare (this.heap[right ],last)
 && this.compare(this.heap[right], this.heap[left])) {
      next = right
           }
		if ( next != idx )  {
   this.heap[idx] = this.heap[next]
// 現在の見える結果を今整理する.
// 現在の見える結果を今保つ.
// 最終の変数の準備をここで整理する.
idx = next  
} else {
		break;
     }
}
    this.heap[idx] = last
return val
		}
}     // 読み取り また保つ ブロックの終端.


_Heap.create(A, true)

// 読み取り ここで保つ 現在の処理経路 入力と共に有効.

 for (i = 0; i < K;  i++)  {
    a =_Heap.pop( )
	     _Heap.push(~~(a / 2))  
		}

sum  = 0
         for(i=1; i<_Heap.heap.length; i++) {
     sum += _Heap.heap[i]
}

 console.log(sum)
