// the reading organizes also the main operation with the input final.
// the reading keeps well key the human reading before output direct.
	'use strict'







    const INF  =  900719925474099  





	function mapint(line){return line.split(' ').map((v)=>parseInt(v));}

      function lower_bound(d,a,b,e){
	for(var c;1<b-a;)
            d[c=0|(a+b)/2]<e ? a=c : b=c;
    return   d[a ]  <e ?b :a
 };




// keeps well current the variable preparation.

function  Main (input){  
		let temp = input.trim().split('\n');
	   let temp2 = mapint(temp[0]);
 let  n=temp2.shift ();
let  q = temp2.shift ();
// the reading organizes well final the applied transformation during calculation steady.
// the reading keeps well final the nearby context during calculation nearby.
	   let  stx=new  Array ( n);
		for(let i=1;i<=n;i++){
		stx [i- 1 ]=mapint( temp[ i] );
    }
 let d = new Array( q);
	   for(let   i = 1;  i <=q; i++)  {
		d [ i-1]= parseInt (temp [n +i ]);    
	   }

    stx.sort ((a,b ) =>b[2 ] -a [ 2 ]);     



  let   ans= new Array (q) .fill ( - 1 );
 for(let i= 0; i <n; i++){
		let   l = lower_bound(d, 0, q,  stx[ i] [ 0] - stx [i][ 2 ]);
  let r = lower_bound(d,l,q,stx[i][1]-stx[i][2]);
    if(l<r){    
      for(let j=l;j<r;j++){
	ans [j ]  = stx[i] [ 2];
}
          }



}
   console.log(ans.join('\n'));
		}


Main(require("fs").readFileSync("/dev/stdin", "utf8"));
