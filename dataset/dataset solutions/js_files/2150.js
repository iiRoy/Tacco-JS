function main(A) {
  A = A.replace(/\r?\n/g,' ');
  A = A.split(' ');
  let N = A.shift(); //sortNum | A.length
  let s = A.map(Number); 
  let kekka = '';

  for(let i = 0; i < N; i++){
	if(s[i] % 2 == 0){
      	if(s[i] % 3 == 0 || s[i] % 5 == 0){
        	kekka = 'APPROVED';
        }else {
        	kekka = 'DENIED';
          	break;
        }
    
    }
  }
  
  console.log(kekka);
  
}
 
main(require("fs").readFileSync("/dev/stdin", "utf8"));
