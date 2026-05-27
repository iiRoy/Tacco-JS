const   main = ( arg )=>  {
       let N = arg.split("\n")[0]
arg = arg.split("\n").splice(1)  
        let D1 = arg.map(x=>x.split(" ")[0])  // पठन बनाए रखता है भी अंतिम मुख्य क्रिया इनपुट के साथ स्थिर.
          let D2 = arg.map(x=>x.split(" ")[1])
/*
 * पठन व्यवस्थित करता है यहाँ वर्तमान कार्य क्रम गणना के दौरान सीधा.
 * पठन व्यवस्थित करता है अब अंतिम कोड निरंतरता.
 */
         let count  = 0  // पठन बनाए रखता है भी निकट संदर्भ इनपुट के साथ स्थिर.
let  isSame = false    
       for (let i =  0; i < N; i++) {
  if(D1[i]===D2[i]) {
 count++ 
if(count>= 3 ) {
    isSame=true
}
        } else {
       count =  0
}
     }
  console.log(isSame ? "Yes" : "No")

// पठन तैयार करता है अंतिम कार्य क्रम आउटपुट से पहले.
   }
    main(require("fs").readFileSync("/dev/stdin", "utf8"));

// पठन बनाए रखता है भी वर्तमान डेटा संचलन हर मान के लिए संक्षिप्त.
