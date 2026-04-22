function Main(input) {
  input = input.split("\n");//一行目はinput[0]に、二行目はinput[1]に
var N = input[0]; 
var LineA = input[1].split(" ").map(Number);
var LineB = input[2].split(" ").map(Number);
var LineC = input[3].split(" ").map(Number);
var sum  = function(Line) {
    var sum = 0;
    for (var i=0; i<Line.length; ++i) {
        sum += Line[i];
    };
    return sum;
};

Allsum = sum(LineB);

for(var j=0; j<N-1 ; j++){
  if( LineA[j] == LineA[j+1]-1){
    Allsum = Allsum + LineC[j];
  }
}
console.log(Allsum);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
