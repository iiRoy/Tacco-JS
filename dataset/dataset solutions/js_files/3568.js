function Main(input){
	input = input.split(" ").map(a=>~~a);
  var x1 = input.shift();
  var y1 = input.shift();
  var x2 = input.shift();
  var y2 = input.shift();
  
 	var x3 = x2 - (y2 - y1);
  var y3 = y2 + (x2 - x1);
  var x4 = x3 - (x2 - x1);
  var y4 = y3 - (y2 - y1);
  return [x3,y3,x4,y4].join(" ");
}

// If you are interested in the algorithms I used, 
// there is no need to read down from this line.

((b,c,d)=>"undefined"!=typeof require?console.log(Main(require("fs").readFileSync("/dev/stdin","utf8"))):[b=b.split("\n").slice(1,-1).join("\n"),c=function(){try{return Main(b)}catch(f){return f.stack||f.message}}(),d=typeof c,"string"==d||(c=JSON.stringify(c)),$("<form>").append([[10,b],0,[1,d],0,[10,c]].map(f=>$(f?"<textarea>":"<br>",f&&{rows:f[0],cols:40,text:f[1]}))).appendTo("body")])(`
31 -41 -59 26
`);