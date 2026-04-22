const input = process.argv.slice(2)

const tableTennis = ([N, A, B]) => {
  // one table in between
  if (B - A == 2) {
    return 1;
  } 
  
  // uneven tables in between
  if ((B - A - 1) % 2 != 0) {
    return Math.abs(A - B) / 2;
  }
  
    // if A closer
    if (A - 1 <= N - B) {
       
      // more or equal than 4 tables between A and B
      if (B - A - 1 >= 4) {
        return A - 1 + (B - A - 2);
      }
      
      if (B - A - 1 == 2) {
        return A - 1  + 2;
      }
      
      return B - 1;
    }
    
    // if B closer
    if (A - 1 > N - B) {
      
      // more or equal than 4 tables between A and B
      if (B - A - 1 >= 4) {
        return N - B + (B - A - 2);
      }
      
      if (B - A - 1 == 2) {
        return N - B + 2;
      }
      
      return N - A;
    }
  
}

console.log(tableTennis(input))