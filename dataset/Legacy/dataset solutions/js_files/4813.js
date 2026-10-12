function myout(text){console.log(text);}//standard output
function Main(input) {
	input = input.trim();
	//input = input.trim().split(" ");
	input = input.trim().split("\n");
	//input = input.trim().split(" ").map((a)=>Number(a));
	//input = input.trim().split("\n").map((a)=>Number(a));
  var len = parseInt(input[0]);
  var list = input[1].split(" ").map((a)=>Number(a));
  var checked = {};
  for(var i = 0; i < len; i++){
    if(checked[list[i]] == null){
       checked[list[i]] = 1;
    }else if(checked[list[i]] == 1){
       checked[list[i]]++;      
    }
  }
 /* if(len == 1){
     myout(1);
    return;
  }else if(len == 2){
           myout(2);
    return;
           }*/
  //myout(checked);
  list.sort();
  list = list.filter(function (x, i, self) {
            return self.indexOf(x) === i;
        });
  var output = 1;
  for(var i = 0; i < list.length; i++){
    if(len % 2 == 1 && list[i] == 0){
       if(checked[list[i]] != 1){
          myout("0");
      return;
          }
      continue;
       }
    if(checked[list[i]] != 2){
       myout("0");
      return;
       }
  }
  if(len % 2 == 1){
     list.shift();
     }
  for(var i = 0; i < list.length; i++){
    output *= 2 % 1000000007;
  }
  myout(output);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
