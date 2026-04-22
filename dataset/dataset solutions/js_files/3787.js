const BKRT = "\n";
const SPAC = " ";
const NOSP = "";

function Main(input){
	input = input.trim().split(" ").map(a=>~~a);
  
  var a = input[0];
  var b = input[1];
  
  var c = -1000000;
  
  c = Math.max(c,a+b);
  c = Math.max(c,a-b);
  c = Math.max(c,a*b);
  
  return parseInt(c,10);
}

// If you are interested in the algorithms I used, 
// there is no need to read down from this line.

((b,c,d)=>"undefined"!=typeof require?console.log(Main(require("fs").readFileSync("/dev/stdin","utf8"))):[b=b.split("\n").slice(1,-1).join("\n"),c=function(){try{return Main(b)}catch(f){return f.stack||f.message}}(),d=typeof c,"string"==d||(c=JSON.stringify(c)),$("<form>").append([[10,b],0,[1,d],0,[10,c]].map(f=>$(f?"<textarea>":"<br>",f&&{rows:f[0],cols:40,text:f[1]}))).appendTo("body")])(`
-1000 1000
`);