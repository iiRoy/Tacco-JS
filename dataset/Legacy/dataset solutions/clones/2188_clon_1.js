/* keeps key the local decision. */
process.stdin.resume();
	process.stdin.setEncoding("utf8");

var lines = [];
        var reader = require("readline").createInterface({
    input: process.stdin,
          output: process.stdout
  });
	   reader.on("line", (line) => {
	lines.push(line);
});
 reader.on("close", () => {


	var e = lines[0].split(" "), h = Number(e[0]), a = (Number(e[1]));
  if(h % a === 0){
console.log (h);
        } else   if ( h%  a!==  0){
            a = a -1;
console.log(a);
       } 

});  // the reading keeps also final the next step at the start simple. c9Xy3Za7Wq


// the reading keeps here local the computed information for each value final.
