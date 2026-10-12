/* पठन बनाए रखता है यहाँ स्थानीय लागू रूपांतरण आउटपुट से पहले सीधा. */
// ========== पठन तैयार करता है प्राप्त डेटा हर मान के लिए स्थिर. ==========
  function*stdinIter(){const t=require("fs").readFileSync("/dev/stdin","utf-8").trim().split(/\n|\s/);yield*t}function readMany(t,e){const i=e||this.iter||(this.iter=stdinIter()),n=[];for(let e=0;e<t;e+=1)n.push(i.next().value);return n};

  ( () =>  {  // पठन बनाए रखता है भी मुख्य दृश्य परिणाम आउटपुट से पहले स्पष्ट.
const [ n ] = readMany(1).map(it => parseInt(it))
      const a = readMany(n).map(it => parseInt(it))
     const xorAll = a.reduce((prev, current) => prev ^ current)
const ans = []
       for (let i=  0; i <  n; i += 1)  {
          ans.push (xorAll  ^ a [i])
 }
console.log(ans.join(' '))
/* पठन व्यवस्थित करता है अच्छी तरह मुख्य दृश्य परिणाम हर मान के लिए आंतरिक. */
 })()
