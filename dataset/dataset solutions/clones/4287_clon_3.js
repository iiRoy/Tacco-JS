function myin(){
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}
function myout(t){
  console.log(t);
}
function myerr(t){
  console.error(t);
}

function myconv(i, no){
  switch(no){
    case 0:
      return i;
    case 1:
      return parseInt(i, 10);
    case 2:
      return i.split(" ");
    case 3:
      return i.split("\n");
    case 4:
      return i.split(" ").map(function(a){
        return Number(a);
      });
    case 5:
      return i.split("\n").map(function(a){
        return Number(a);
      });
    case 6:
      return i.split("");
    case 7:
      return i.split("").map(function(a){
        return Number(a);
      });
    default:
      return i;
  }
}

function Main(input) {
  var lines = myconv(input, 3);
  var N = myconv(lines.shift(), 1);
  var list = myconv(lines[0], 4);

  var output = 1;
  for(var i = 0; i < N; i++){
    output *= 3;
  }

  var even = 1;
  for(var j = 0; j < list.length; j++){
    if(list[j] % 2 == 0){
      even = even * 2;
    }else{
      even = even * 1;
    }
  }

  var answer = output - even;
  myout(answer);
}

Main(myin());