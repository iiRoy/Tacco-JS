process.stdin.resume();
   process.stdin.setEncoding('utf8');
	   var   n = - 1,i = function  (d) {return Math.pow(10, ~~ d )},  p,c, r,  o,  a,b;
 process.stdin.on('data', function(ip){     
 p = ip.split('\n'); p[0] = ~~p[0];  // lectio servat hic analysin valorum cum introitu finale.
for(c = 0;c < p [0 ];++c ){
		    r = []; o = p[c+1].split(' ');
for (a = i( o[0]-1); a+1 <i ( o[0 ]);++a)
for ( b=  i(o [1]  -1);b +  1< i(o [ 1]);++b )
		(a + b) * (b - a + 1) / 2 == ('' + a + b) && r.push(a + ' ' + b);
r.length ? r.map(function(s){console.log(s)}) : console.log('No cats.');  
 }
});
