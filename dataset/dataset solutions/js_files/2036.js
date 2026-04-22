function Main(input) {
    input = input.split("\n");
  	var X = input[0].split(" ")[0]-0;
  	var Y = input[0].split(" ")[1]-0;
  	var p = input[1].split(" ").map(v=>v-0).sort((a,b)=>b-a).filter((v,i)=>i<X);
  	var q = input[2].split(" ").map(v=>v-0).sort((a,b)=>b-a).filter((v,i)=>i<Y);
  	var r = input[3].split(" ").map(v=>v-0).sort((a,b)=>b-a);
  	var pi = p.length-1;
  	var qi = q.length-1;
  	for(var i=0;i<r.length;i++){
  	    var rr = r[i];
  	    if((rr>p[pi]&&pi>=0) || (rr>q[qi]&&qi>=0)){
  	        if(pi>=0 && p[pi] < q[qi]){
  	            p[pi] = rr;
  	            pi--;
  	        }else if(qi>=0){
  	            q[qi] = rr;
  	            qi--;
  	        }
  	    }
  	}
  	var ans = 0;
  	p.forEach(v=>ans+=v);
  	q.forEach(v=>ans+=v);
  	console.log(ans);

}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

