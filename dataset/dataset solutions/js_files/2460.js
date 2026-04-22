function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
function myout(t){console.log(t);}//standard output
//[no]param
//0:何もしない  1:数値へ変換  2:半角SPで分割  3:改行で分割  4:半角SPで分割し、数値配列へ
//5:改行で分割し、数値配列へ  6:1文字に分割  7:1文字に分割し、数値配列へ
function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}

function Main(input) {
  var counter = new Array(input.length+1);
  input = myconv(input,6);
  if(input[0] == "<"){
     counter[0] = 0;
  }
  if(input[input.length-1] == ">"){
     counter[input.length] = 0;
  }
  for(var i = 1; i < input.length; i++){
    var mae = input[i-1];
    var ato = input[i];
    if(mae == ">" && ato == "<"){
       counter[i] = 0;
    }else if(mae == "<" && ato == ">"){
       counter[i] = "x";      
	}
  }
  //myout(counter);
  var sum = 0;
  var tmp = 0;
  for(var i = 0; i < counter.length; i++){
    if(i == 0){
       if(counter[0] == null){
          counter[0] = 1;
       }
      continue;
    }
    if(counter[i] == 0){
    	continue;
    }
    if(counter[i-1] == 0){
       counter[i] = 1;
    }else if(counter[i] == "x"){
      counter[i] = counter[i-1]+1;
      if(counter[i+1] != 0){
      	counter[i+1] = 1;
      }
      i++;
      continue;
    }else{
      counter[i] = counter[i-1]+1;
    }
    
  }
  
  for(var i = 0; i < counter.length; i++){
    sum += counter[i];
  }
  //myout(counter);
  myout(sum);
}

Main(myin());
