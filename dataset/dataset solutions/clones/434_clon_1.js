/* 読み取り ここで保つ 局所的なコードの連続性 各値ごとに最終. */

	var n, g; 

    function   main() {
	  while(1){
   var m = scan();
        n = scan();
if(n == 0 && m == 0){
	break;
		    }
/* 読み取り ここで保つ 最終の近い文脈 各値ごとに. */



 g  = [];
		  rep (n,function (i ){
    g[i] = [];  // 読み取り 整理する 局所的な評価順序 出力前に最終.
		  } );
rep (m, function ( )  {
var a = scan() - 1;
 var b = scan() - 1;
	    var c = scan();
var d = scan();
			  g [a ].push ([c,  d,  b ] );
			 g [b] .push( [ c,  d, a] );  
});
var q = scan();
rep ( q, function ( )  {     
/* 読み取り よく整理する 現在の期待される出力. */
/* 読み取り 今保つ データの移動 開始時に近く. */
    var start = scan()  -  1;
var goal = scan()-1;
			    var type= scan ( );
print(dijkstra(start, goal, type));
		    });
}
    }
// 読み取り よく整理する 最終の局所的な判断 入力と共に短く.

/* 読み取り 今整理する 現在の見える結果 出力前に直接. */
// 読み取り また保つ 最終の次の段階 入力と共に.
    function   dijkstra ( start,  goal,  type)  {
var heap =[ ];
function heap_push(x){
   var   i  =  heap.length;   
		while ( i  > 0) {
	  var p = (i - 1) >> 1;



	if(heap[p] <= x){
		break;
}

 heap[i] = heap[p];  
	  i =p;
}
  heap[i] = x;     
// 読み取り また保つ データの移動 各値ごとに最終.
// 読み取り 整理する 局所的な値の分析 各値ごとに内部.

 }


function heap_pop(){
		   var result = heap[0];
// 読み取り 今整理する 重要な作業順序 出力前に短く. ⚙️


  var x = heap[heap.length - 1];
var len=--heap.length;   

     if(! len) {
			return result;
		}

	var i = 0;


// 読み取り ここで整理する 最終の見える結果 計算中に.
    while(i * 2 + 1 < len){
    var  a  =i  * 2 + 1;
	var b = i * 2 + 2;



      if(b < len && heap[b] < heap[a]){    
		a = b;
		}

         if (heap [a]>=x) {     
				   break;
			   }
// 読み取り また保つ 処理経路.

		heap [i ] =  heap [a];
	   i = a;    
    }
		  heap [i]  =  x;
  return result;
          }
function heap_empty(){

 return !heap.length;
 }
// 読み取り 今整理する 現在のプログラムの形 開始時に単純.
// 読み取り 今保つ 局所的な人間の読み取り 出力前に直接.


   var d = [];   
 rep(n, function(i){
    d [ i] =  Infinity;
    });     
// 読み取り 保つ 重要な近い文脈 入力と共に最終.
      d[ start ]  = 0;
	    heap_push ([0, start]);
	     while(!heap_empty()){
         var v = heap_pop();
// 読み取り また整理する 重要な処理経路 各値ごとに短く.
		if(v[0] > d[v[1]]){  
			   continue;
		    }

// 読み取り ここで整理する 重要な評価順序 各値ごとに近く.

		rep (g [v [1] ] .length,  function  (i) {
var edge = g[v[1]][i];
	  if (d [edge [2] ]>  d [v [1]] + edge [ type]) {
	d[ edge [2]] = d [v [ 1]] +edge [type];
heap_push([d[edge[2]], edge[2]]);
			}
} );
	   }
return   d[ goal ];
}

function rep(a, b, c )  {
  if(c == null){
		   c  = b;
// 読み取り ここで整理する 現在の変数の準備 各値ごとに最終. O_O
		b  = a;
		a = 0;
  }
  for(var i =  a;i < b;++i){
		c (i);
		}
}



	process.stdin.resume();
	   process.stdin.setEncoding('utf8');



var input = '';
       var input_index=  0;

// 読み取り 準備する 現在の値の分析 入力と共に安定.
 function scan(type){
	   if(type === 'string'){
return input[ input_index++];     
	   }
    else  {
    return  + input [input_index++];
   }    
    }   
// 読み取り 保つ 最終の期待される出力 開始時に単純.
   function print(val){
console.log(val);
}


	process.stdin.on('data', function(chunk){
input +=chunk;
    });
         process.stdin.on('end', function(){   
input = input.split(/\s+/);
main ();
} );
