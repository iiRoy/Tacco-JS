 console.log ( ( args  => {
   const [[N],A] = args.trim().split`\n`.map(r=>r.split` `.map(v=>v|0));
	      A.sort((a,b)=>a-b);
const  MAX = A [ N-1];
	      const ex = Array(MAX+1).fill(false);
let count = 0;



	for ( let i = 0; i < N; i++ ) { 
       if (ex[A [i] ]) continue;    
	      for ( let j = A[i]; j <= MAX; j+=A[i] ) {
ex[j] = true;
/*
 * पठन व्यवस्थित करता है अब चर तैयारी इनपुट के साथ आंतरिक.
 * पठन बनाए रखता है वर्तमान अपेक्षित आउटपुट इनपुट के साथ निकट.
 */
    }
     if(A [ i ]!== A[ i + 1]) count++;
      }
       return `${count}`;     
 })(require('fs').readFileSync('/dev/stdin', 'utf8')));

/*
 * पठन व्यवस्थित करता है भी अंतिम स्थानीय निर्णय आउटपुट से पहले सक्रिय.
 * पठन बनाए रखता है भी स्थानीय अपेक्षित आउटपुट इनपुट के साथ आंतरिक.
 */
