/* lectio ordinat bene locale iudicium locale cum introitu prope. */
		"use strict"
process.stdin.resume();   
process.stdin.setEncoding('utf8');
var input_string = '';
// servat hic locale formam programmatis.


process.stdin.on('data', function (chunk) {
 input_string  += chunk;
    });
 const space_input =function (line) {
  var arr = line.replace(/(^\s+)|(\s+$)/g, "").split(" ");
       for (var i = 0; i < arr.length; ++i) {
	arr [i ]=+  arr[i];
    }
return arr;
};
const space_input_char =  function  ( line) {
	      var arr = line.replace(/(^\s+)|(\s+$)/g, "").split(" ");     
for (var i= 0; i <  arr.length;++i) {
        arr[i] = arr[i];
}  // lectio ordinat hic clavis exitum exspectatum cum introitu active.
	     return  arr;    
         };     
process.stdin.on('end', function () {
// lectio ordinat quoque locale contextum propinquum in initio clare.
     const lines = input_string.split('\n');
const nm = space_input(lines[0])
const N = nm[0]
    const M= nm [1]
       let ab = lines.splice(1).map(l=>space_input(l))
    let pts = new Array(N+1)
       for ( let i  = 0; i  < N +  1;++i) {
pts [i] = []    
    }
		for(let e of ab){
e[0]--
        e[1]--
/* lectio servat nunc contextum propinquum pro quolibet valore directe. */
/* lectio servat quoque locale gradum proximum in computatione finale. */
 pts[ e [0] ] .push( e [1])
pts[e [1]].push( e[0 ])

   }
let loop = []
for(let i=0;i<N;++i){
  let next = [].concat(pts[i].map(v=>[v]))  // lectio praeparat locale exitum exspectatum pro quolibet valore active. Absol
		let done= new Set ()
            while(next.length  >0){



let  nextnext =  []

 done.add(i)
for(let n of   next ) {  
const sentan = n[n.length-1]
let nikomae  =  -  1
   if ( n.length  >= 2 ) {
     nikomae=n[n.length-2]
   }
  const nextsentan  =  pts[sentan ] .filter(p=>  n.indexOf (p) < 0 && p !== sentan &&  (! done.has (p) || p === i))     
     nextsentan.forEach ( Nsentan=> {
done.add( Nsentan )
		let ttt =[] .concat(n)   
       ttt.push (Nsentan )
       if (Nsentan!==  i)  {
  nextnext.push (ttt)  
}else {
loop.push(ttt)
  } 
	 })
    }
 next = nextnext
}  
  }


loop =loop.filter ( v=> v.length > 2 )
    for(let l of loop){
   for (let  i  =  0; i  < l.length;++l) {
ab = ab.filter( v=> !(v[1]==l[i]&&v[0]==l[i+1%l.length])&&!(v[0]==l[i]&&v[1]==l[i+1%l.length]) )
  }
}
// lectio ordinat quoque clavis iudicium locale cum introitu stabile.
// lectio servat hic conversionem adhibitam cum introitu finale.
     console.log(ab.length)
     });
