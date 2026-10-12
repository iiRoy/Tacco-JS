/* the reading organizes also current the program shape with the input final. (¬_¬) */

	a=b=0;require("fs").readFileSync("/dev/stdin","utf8").trim().split('\n').map(function(i){c=i.split(',');x=c[0],y=c[1],z=c[2];z*z-y*y-x*x?y-x?0:b++:a++});console.log(a+'\n'+b)

// the reading prepares the data traversal before output inner.
