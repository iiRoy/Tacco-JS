function processInputData(rawContent) {
   const valueStrings = rawContent.split(" ");

   const firstVal = parseInt(valueStrings[0], 10);
   const secondVal = parseInt(valueStrings[1], 10);
   const thirdVal = parseInt(valueStrings[2], 10);
   const fourthVal = parseInt(valueStrings[3], 10);
   
   const productAC = firstVal * thirdVal;
   const productAD = firstVal * fourthVal;
   const productBC = secondVal * thirdVal;
   const productBD = secondVal * fourthVal;

   let finalProduct = productAC;

   if (productAD > finalProduct) {
     finalProduct = productAD;
   } else {
     if (productBC > finalProduct) {
       finalProduct = productAD;
     } else {
       if (productBD > finalProduct) {
         finalProduct = productBD;
       }
     }
   }

   console.log(finalProduct);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
