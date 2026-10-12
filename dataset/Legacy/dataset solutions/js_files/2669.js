var input = require('fs').readFileSync('/dev/stdin', 'utf8')
  .split("\n").map((s)=>{return s.split(" ").map((i)=>{return i - 0;});});
var N = input[0][0];
var E = input[0][1];
var P = input[0][2];
input.unshift();

var data = {};
for (var i = 1; i < N; i++) { data[i] = []; }
input.forEach((i)=>{
	data[i[0]].push([i[1],i[2]]);
});


(() => {

var route = [1];
var gain = [0];
var pathStack = [Array.from(data[1])];
var paths = pathStack.pop();
var ans = -1;

do {
  var path = paths.pop();
  var p = path[0];
  //console.log("> " +  route + " - " + p);
  if (p == P) {
	// one goal
	ans = Math.max(gain.reduce((p,i)=>{return p+i;},0), ans);
  }
  if (route.indexOf(p) == -1) {
    if (data[p].length > 0) {
      pathStack.push(paths);
      paths = Array.from(data[p]);
      route.push(p);
	  gain.push(path[1]);
	  continue;
    }
  } else {
    //console.log("loop detected");
  }

  while (paths.length == 0) {
    route.pop();
	gain.pop();
    if (pathStack.length > 0) {
      paths = pathStack.pop();
    } else {
      //console.log("bye");
      return;
    }
  }
} while (true)


})();

console.log(ans);