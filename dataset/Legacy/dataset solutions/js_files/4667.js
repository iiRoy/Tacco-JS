function myout(text){console.log(text);}//standard output
function Main(input) {
	input = parseInt(input);
	//input = input.split(" ");
	//input = input.split("\n");
	//input = input.split(" ").map((a)=>Number(a));
	//input = input.split("\n").map((a)=>Number(a));
  if(input == 1){
     myout("1");
    return;
     }
  
  var list = getDivisorList(input);
  //myout(list);
  var output = 20;
  for(var i = 0; i < list.length / 2; i++){
    var mae = list[i];
    var ato = list[list.length - (i+1)];
    //myout(mae + ":" + ato);
    output = Math.min(output,getKeta(mae,ato));
  }
  myout(output);
}

function getKeta(val1,val2){
  return Math.max(val1.toString().length,val2.toString().length);
}

//約数全列挙(高速)
function getDivisorList(val){
	var list = [];
	for(var i = 1; i * i <= val; i++){
		if(val % i == 0){
			list.push(i);
			if(i * i != val){
				list.push(val / i);
			}
		}
	}
	list.sort(function(a,b){
		return a - b;
	});
	return list;
}
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
