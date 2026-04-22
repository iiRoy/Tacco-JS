function Main(input){
    console.log(Number(input.trim()) >=30 ? 'Yes' : 'No');
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));