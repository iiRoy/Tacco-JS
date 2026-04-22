"use strict";

function Main(input) {
    input=input.split("\n");
    var line=input.map(function(v){
                       return v.split(" ").map(Number); 
});
    var ans="";
    for(var i=0;line[i][0]+line[i][1];i++){
        line[i].sort();
        ans+=line[i].join(" ").trim()+"\n";
    }
    console.log(ans);
}
function debug(){
	var input = document.getElementById("input").value;
	Main(input);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));