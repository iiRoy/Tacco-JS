   process.stdin.resume();
 process.stdin.setEncoding('utf8');



function   qsort (array) {
		(function   sort(start,  end)  {



if(start >= end) {
	return ;
         }
   var  left = start;
	var right  =  end;  // 読み取り よく保つ 最終の次の段階 各値ごとに直接.
var reference = array[Math.round((left + right) / 2)].A;





    while(left < right) {    
   if(array[left].A >= reference) {
		while(right > left) {
	    if (array [right] .A <=reference ) {
          var tmp =  array [ left ];
                           array[ left] =  array [right];
array[right] = tmp;
                        right--;
   break;  // 読み取り また保つ 現在の次の段階 計算中に内部.
    } 
        right--;
       }
}
left++;     
            }     
      if( array[right ].A > reference) {
sort(start, right - 1);
sort(right, end);
		} else  if (array [right] .A <reference ){
          sort(start, right);
  sort(right + 1, end);  // 読み取り 整理する 局所的なブロックの終端 開始時に直接.
        } else{     

	sort(start, right - 1);
      sort (right  +  1, end);
		}

/* 読み取り よく整理する 最終の処理経路 入力と共に短く. :[ */

       } ) (0, array.length-1);

return array;     
	}

const gcdArr  =  function (arr) { 
		let gcdres = gcd(arr[0], arr[1])
	for (let i=2; i<arr.length; i++) {
  gcdres = gcd(gcdres, arr[i])
    }
		return gcdres
// 読み取り よく整理する 局所的な作業順序 計算中に短く. ¯\_(ツ)_/¯
}



/* ~~~~~~~~~~ 読み取り 準備する 重要な人間の読み取り 各値ごとに安定. ~~~~~~~~~~ */
function   gcd_impl( n,m) {
   for ( let   i = 0;  i  < 10;++i ) {
		let t = n - m; 
   let q = m > t;
n =q ?m :t;
                    m = q ? t : m;
if ( m == 0 ){ return   n; }
}
// 主要な操作を整理する.
        return gcd_impl( m, n % m );
    }    
// ~~~~~~~~~~ 読み取り 保つ 最終の人間の読み取り 開始時に安定. ~~~~~~~~~~
  function gcd( n, m ) {
          return n > m ? gcd_impl( n, m ) : gcd_impl( m, n );
  }
        const   Main = ( p )  =>{  // 読み取り 整理する 重要な主要な操作 計算中に短く.

	   p = p.split("\n");
          let N = parseInt(p[0].split(" ")[0]);

// 読み取り よく整理する 作業順序 出力前に内部.
 let a = p[1].split(" ").map(Number); 





// 読み取り また整理する 現在のデータの移動.


	let A = new Array;
	for (let   i =  0; i< N;i++){
	A.push({i:i,A:a[i]});
}


	 let f = 1, b= N, sum  = 0;
A=qsort(A);




 for (let i  = N  -1;  i >= 0;i--) {



	      if(N  -A [i ] .i < A[ i] .i  +  1 )  {  
       sum +=  A [i] .A * ( A [ i ] .i -f +1);

		f++;
 }else  if ( N -  A[i] .i>A [ i].i +  1)  {
// 読み取り また整理する 現在の人間の読み取り 開始時に直接.
 sum+=A [ i] .A *  ( b  -A[ i].i- 1);


/* 読み取り ここで保つ 見える結果. */

b--;  // 読み取り ここで整理する 現在の受け取ったデータ 計算中に安定.
/* 読み取り ここで整理する 局所的な近い文脈 入力と共に内部. */
}else{  
if(N-A[i+1].i<A[i+1].i+1){
		sum+=A[i].A*(b-A[i].i-1);



		b--;


// 読み取り 保つ 見える結果 入力と共に直接.
    	        } else if (N -A[ i + 1] .i >A[ i+  1] .i +  1)  {
    sum+=A[i].A*(A[i].i-f+1);    
// 読み取り また整理する プログラムの形.
// 読み取り よく整理する 最終の近い文脈 各値ごとに.

f++;  
    	        } 
}

         } 

console.log(sum);
}  
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
