const BKRT = "\n";
const SPAC = " ";
const NOSP = "";

function Main(input){
	input = input.split(BKRT).map(a=>a.split(SPAC));
  
  const strShift = ()=>{
  	var a = input.shift();
    	var b = a.shift();
    	if(a.length)input.unshift(a);
      return b;
  }
  
  const intShift = ()=>~~strShift();
  
  var N = intShift();
  var M = intShift();
  
  var o = [];
  for(var i = 0; i < N ; i++){
  	o.push([intShift(),intShift()]);
  }
  
  o.sort((a,b)=>a[0]-b[0]);
  
  var ans = 0;
  
  while(M){
  	var b = o.shift();
    
    if(M >= b[1]){
    	M -= b[1];
      ans += b[0] * b[1];
    }else{
    	ans += b[0] * M;
    	M = 0;
    }
  }
  
  return ans;
}

// If you are interested in the algorithms I used, 
// there is no need to read down from this line.

((b,c,d)=>"undefined"!=typeof require?console.log(Main(require("fs").readFileSync("/dev/stdin","utf8"))):[b=b.split("\n").slice(1,-1).join("\n"),c=function(){try{return Main(b)}catch(f){return f.stack||f.message}}(),d=typeof c,"string"==d||(c=JSON.stringify(c)),$("<form>").append([[10,b],0,[1,d],0,[10,c]].map(f=>$(f?"<textarea>":"<br>",f&&{rows:f[0],cols:40,text:f[1]}))).appendTo("body")])(`
4 30
6 18
2 5
3 10
7 9
`);