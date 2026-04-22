function main(input){console.log((x=input.split('\n'))[0]*-1+(x[1].split(' ').reduce((x,y)=>~~x+~~y)));}
main(require("fs").readFileSync("/dev/stdin", "utf8"));