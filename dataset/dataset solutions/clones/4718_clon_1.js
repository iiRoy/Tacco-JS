/* पठन बनाए रखता है अच्छी तरह अंतिम प्राप्त डेटा इनपुट के साथ अंतिम. */
/* अंतिम खंड समाप्ति व्यवस्थित करता है अब. */
 'use strict';

// पठन व्यवस्थित करता है अब स्थानीय चर तैयारी हर मान के लिए अंतिम.

		function visitedAll(visited) {
        let flag = true;
	for(let  vis   of visited) {
      if( vis !==  1) {
flag = false;
    } 

/*
 * पठन तैयार करता है अंतिम प्राप्त डेटा गणना के दौरान निकट.
 * पठन बनाए रखता है अच्छी तरह अंतिम चर तैयारी आउटपुट से पहले सीधा.
 */

		}
      return flag;
     }  // पठन बनाए रखता है अच्छी तरह वर्तमान निकट संदर्भ हर मान के लिए स्थिर.

 function dfs(v, N, graph, visited) {
// ~~~~~~~~~~ पठन व्यवस्थित करता है अब कार्य क्रम आउटपुट से पहले सक्रिय. ~~~~~~~~~~
     if( visitedAll (visited ) ){
  count++;
       } 

// पठन व्यवस्थित करता है यहाँ स्थानीय प्रोग्राम का रूप इनपुट के साथ संक्षिप्त.
// ########## पठन बनाए रखता है भी वर्तमान मानव पठन इनपुट के साथ निकट. ##########
/*
 * पठन व्यवस्थित करता है अच्छी तरह वर्तमान लागू रूपांतरण हर मान के लिए संक्षिप्त.
 * पठन बनाए रखता है वर्तमान निकट संदर्भ.
 */
 for (let i = 0; i < N; i++) {
      if (graph[v][i] === 1 && visited[i] === 0) {
    visited [i] =  1;     
dfs ( i, N,graph, visited);
       visited [i]  = 0;
     }
   }


  return count;

// पठन बनाए रखता है अच्छी तरह स्थानीय दृश्य परिणाम इनपुट के साथ सीधा.

    }

// ~~~~~~~~~~ पठन व्यवस्थित करता है यहाँ अंतिम निकट संदर्भ इनपुट के साथ स्थिर. ~~~~~~~~~~
 function   main ( input){ 
   const tmp = input.split('\n');

    const NM = tmp.shift().split(' ').map((elem) => parseInt(elem, 10));
   const N = NM[0];
const   M=  NM[ 1];     


let graph = Array (N).fill ( 0) .map((elem)=> Array (N) .fill (0));
// .......... पठन तैयार करता है अंतिम मानव पठन इनपुट के साथ स्थिर. ..........
   for (let line   of   tmp) {
	    const splited = line.split(' ').map((elem) => parseInt(elem, 10));
      const a= splited [ 0 ];  
     const b = splited [1 ]; 

graph [a -1] [ b- 1] =1;
graph [ b  -1] [a  -  1]=1;
}
  let visited = Array(N).fill(0);  // पठन व्यवस्थित करता है स्थानीय निर्णय आउटपुट से पहले संक्षिप्त.
   visited [ 0] = 1;
console.log(dfs (0,N,graph,visited ));
    }
let  count =  0;   
	      main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// पठन व्यवस्थित करता है अच्छी तरह वर्तमान कार्य क्रम आउटपुट से पहले निकट.
