function Main(input){
	input = ~~input.split("\n")[0];
  var arr = ["0","3","5","7"];
  var count = 0;
  for(var a of arr){
  for(var b of arr){
  for(var c of arr){
  for(var d of arr){
  for(var e of arr){
  for(var f of arr){
  for(var g of arr){
  for(var h of arr){
  for(var i of arr){
  	var hoge = [a,b,c,d,e,f,g,h,i];
    hoge = (""+~~(hoge.join(""))).split("");
    if(hoge.length < 3)continue;
    if(hoge.find((j)=>j==0) !== undefined)continue;
   	if(hoge.find((j)=>j==3) && hoge.find((j)=>j==5) && hoge.find((j)=>j==7)){
    	var value = ~~hoge.join("");
      if(value > input)return count;
      count++;
    }
  }
  }
  }
  }
  }
  }
  }
  }
  }
  return count;
}

// If you are interested in the algorithms I used, 
// there is no need to read down from this line.

((b,c,d)=>"undefined"!=typeof require?console.log(Main(require("fs").readFileSync("/dev/stdin","utf8"))):[b=b.split("\n").slice(1,-1).join("\n"),c=function(){try{return Main(b)}catch(f){return f.stack||f.message}}(),d=typeof c,"string"==d||(c=JSON.stringify(c)),$("<form>").append([[10,b],0,[1,d],0,[10,c]].map(f=>$(f?"<textarea>":"<br>",f&&{rows:f[0],cols:40,text:f[1]}))).appendTo("body")])(`
999999999
`);