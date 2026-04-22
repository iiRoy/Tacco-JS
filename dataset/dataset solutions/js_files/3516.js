function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
function myout(t){console.log(t);}//standard output
function myerr(t){console.error(t);}//standard error
//[no]param
//0:何もしない  1:数値へ変換  2:半角SPで分割  3:改行で分割  4:半角SPで分割し、数値配列へ
//5:改行で分割し、数値配列へ  6:1文字に分割  7:1文字に分割し、数値配列へ
function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}
function Main(input) {
  input = myconv(input,3);
  var N = myconv(input[0],1);
  var list = myconv(input[1],2);
  var oddlist = {};
  var evenlist = {};
  for(var i = 0; i < N; i++){
    //偶奇が一致するところだけ関係する
    if(i % 2 == 0){
       if(oddlist[list[i]] == null){
     	  oddlist[list[i]] = 1;
    	}else{
    	   	oddlist[list[i]]++;
    	}
    }else{
       if(evenlist[list[i]] == null){
     	  evenlist[list[i]] = 1;
  	  }else{
   	  	 evenlist[list[i]]++;
  	  }
    }
  }
  
  var output = 0;
  var oddSet = Array.from(Object.keys(oddlist));
  var evenSet = Array.from(Object.keys(evenlist));
  if(oddSet.length == 1 && evenSet.length == 1 && evenSet[0] == oddSet[0]){
     myout(N/2);
    return;
  }
  var tmp = 0;
  var lastSelect = "";
  for(var i = 0; i < oddSet.length; i++){
    if(tmp < oddlist[oddSet[i]]){
    	tmp = oddlist[oddSet[i]];
    	lastSelect = oddSet[i];
  	}
  }
  output += (N/2) - tmp;
  tmp = 0;
  if(evenSet.indexOf(lastSelect) != -1){
  	evenSet.splice(evenSet.indexOf(lastSelect),1);
	}
  for(var i = 0; i < evenSet.length; i++){
    if(lastSelect == evenSet[i]){
       //continue;
    }
    tmp = Math.max(tmp,evenlist[evenSet[i]]);
  }
  myerr(oddSet);
  myerr(evenSet);
  output += (N/2) - tmp;
  myout(output);
}
Main(myin());