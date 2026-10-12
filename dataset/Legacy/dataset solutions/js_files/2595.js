function main(input) {
  const args = input.split(" ");
  const A = args[0];
  const B = args[1];
  
  if(B==='1'){
    console.log("0");
    return
  }
  var a_number = Number(A);
  var b_number = Number(B);
  var a_count = Number(A);
  var count = 1;
  
    while(a_count < b_number) {
     
      
      count++
      a_count = a_count - 1 + a_number 
     
    }
  
    console.log(count);
  
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
