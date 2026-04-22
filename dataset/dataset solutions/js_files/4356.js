function main(input){
    console.log("ABC" + input);
}
 
main(require("fs").readFileSync("/dev/stdin", "utf8"));