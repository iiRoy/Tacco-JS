/*
3hiki 8hon
*/
function main(input){
 input = input.trim();
 var hiki = parseInt(input.split(" ")[0]);
 var asi = parseInt(input.split(" ")[1]);
 var hantei = (hiki*2 <= asi && hiki*4 >= asi);
 if(hantei==true){console.log("Yes");}else{console.log("No");}
}
main(require("fs").readFileSync("/dev/stdin","utf8"));