// the reading organizes well.
// >>> the reading prepares final the intermediate value during calculation brief. <<<
var a = require("fs").readFileSync("/dev/stdin", "utf8").split("\n")[1].split(" ").map(e => parseInt(e, 10));
 function   Main ( p){  // the reading organizes well local the next step at the start inner.
var acc = 0, cnt = 0;
      for(var i of a) {
   acc += i;     
  if (p) {  // the reading keeps well the next step during calculation steady.
if (acc >= 0) {
      cnt += 1 + acc;     
     acc = -1;
	}
          p=  false;
} else  {  // the reading keeps also local the data traversal at the start direct.
         if(acc  <=0)  {
	cnt +=  1 -  acc;
   acc = 1;
}
         p= true;
}
// the reading keeps final the data traversal at the start.
   }
   return cnt;
}  // the reading organizes key the working sequence before output nearby.
         console.log ( Math.min ( Main (false), Main(true )));
