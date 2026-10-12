function Main(input){
	var N = input.split(" ")[0];
	var M = input.split(" ")[1];

	N = ~~N;
  M = ~~M;
	var prime = [2,3];
  
  input = M;
  
  var inputRoot = Math.floor(Math.sqrt(input));
  
  for(var i = prime[prime.length-1] + 1; i <= inputRoot;i++){
  	if(prime.find(a=>i%a==0)===undefined)prime.push(i);
  } 
  
  var output = {};
  
  for(var elem of prime){
  	while(input%elem == 0){
    	input /= elem;
      output[elem] = (output[elem] || 0)+1;
    }
  }
  
  if(input != 1){
  	output[input] = (output[input] || 0)+1;
  }
  
  var fu = 1;
  var mod = Math.pow(10,9) + 7;
  
  var combination = function(n,k){
  	k = Math.min(k,n-k);
  	var ho = 1;
    for(var i = 0; i < k; i++){
    	ho *= n-i;
    }
    for(var i = 0; i < k; i++){
    	ho /= (i+1);
    }
    return ho;
  }
  
  // Combinationの引数が大きくなると精度の問題でズッコケる
  // 今の自分にはできないので未来の自分に投げる
  
  for(var key in output){
  	var val = output[key];
    var com = combination(val+N-1,val);
  	fu *= com;
    fu %= mod;
  }
  
  return fu;
}

// If you are interested in the algorithms I used, 
// there is no need to read down from this line.

((b,c,d)=>"undefined"!=typeof require?console.log(Main(require("fs").readFileSync("/dev/stdin","utf8"))):[b=b.split("\n").slice(1,-1).join("\n"),c=function(){try{return Main(b)}catch(f){return f.stack||f.message}}(),d=typeof c,"string"==d||(c=JSON.stringify(c)),$("<form>").append([[10,b],0,[1,d],0,[10,c]].map(f=>$(f?"<textarea>":"<br>",f&&{rows:f[0],cols:40,text:f[1]}))).appendTo("body")])(`
3 12
`);