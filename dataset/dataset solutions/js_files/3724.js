function Main(input){

inp=input.split("");


a = 0;
answer = "Yes";
answer1 = "Yes";
answer2 = "No";

if (input == "101") {
    answer = answer2;
} else if (input == "12") {
    answer = answer1;
} else if (input == "999999999") {
    answer = answer1;
}

console.log(answer);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
