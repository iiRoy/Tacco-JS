process.stdin.resume();
process.stdin.setEncoding('utf8');
// Your code here!

function qsort(array) {
    (function sort(start, end) {
        //再帰出口;
        if(start >= end) {
            return;
        }
        var left = start;
        var right = end;
        var reference = array[Math.round((left + right) / 2)].A;
        //左から値を見ていく;
        //最終的にleftとrightは同じindexになるか交差する;
        //交差した場合はleft > rightになる;
        while(left < right) {
            if(array[left].A >= reference) {
                while(right > left) {
                    if(array[right].A <= reference) {
                        var tmp = array[left];
                        array[left] = array[right];
                        array[right] = tmp;
                        right--;
                        break;
                    }
                    right--;
                }
            }
            left++;
        }
        if(array[right].A > reference) {
            sort(start, right - 1);
            sort(right, end);
        }else if(array[right].A < reference) {
            sort(start, right);
            sort(right + 1, end);
        }else {
            //array[right]がreferenceと同じ値の時の処理;
            sort(start, right - 1);
            sort(right + 1, end);
        }
    })(0, array.length - 1);
 
    return array;
}

const gcdArr = function(arr) {
  let gcdres = gcd(arr[0], arr[1])
  for (let i=2; i<arr.length; i++) {
    gcdres = gcd(gcdres, arr[i])
  }
  return gcdres
}
 
function gcd_impl(n,m) {
        for( let i = 0; i < 10; ++i ) {
                let t = n - m;
                let q = m > t;
                n = q ? m : t;
                m = q ? t : m;
                if( m == 0 ) { return n; }
        }
        return gcd_impl( m, n % m );
}
 
function gcd( n, m ) {
        return n > m ? gcd_impl( n, m ) : gcd_impl( m, n );
}
 
const Main = (p)=>{
	// 1行目がinput[0], 2行目がinput[1], …に入る
	p = p.split("\n");
	let N = parseInt(p[0].split(" ")[0]);
	//let M = parseInt(p.split(" ")[1]);
	let a = p[1].split(" ").map(Number);
	//文字列から10進数に変換するときはparseIntを使います
	//出力
	
	let A = new Array;
	for(let i=0;i<N;i++){
	    A.push({i:i,A:a[i]});
	}
	
	let f=1,b=N,sum=0;
	A=qsort(A);
	//console.log(A);
	for(let i=N-1;i>=0;i--){
	    //console.log(A[i],N-A[i].i,A[i].i+1)
	    //console.log(f,b)
	    if(N-A[i].i<A[i].i+1){
	        sum+=A[i].A*(A[i].i-f+1);
	        //console.log("toF",A[i].A*(A[i].i-f+1),sum)
	        f++;
	    }else if(N-A[i].i>A[i].i+1){
	        sum+=A[i].A*(b-A[i].i-1);
	        //console.log("toB",A[i].A*(b-A[i].i-1),sum)
	        b--;
	    }else{
	        if(N-A[i+1].i<A[i+1].i+1){
	            sum+=A[i].A*(b-A[i].i-1);
	            //console.log("toB*",A[i].A*(b-A[i].i-1),sum)
    	        b--;
    	        
    	    }else if(N-A[i+1].i>A[i+1].i+1){
    	        sum+=A[i].A*(A[i].i-f+1);
    	        //console.log("toF*",A[i].A*(A[i].i-f+1),sum)
    	        f++;
    	    } 
	    }
	    
	}
	
	console.log(sum);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));