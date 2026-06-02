// lectio servat praesens valorem medium in initio 30. P1oI6uY2tR

        "use strict";

		const main = arg => {
 arg = arg.trim().split("\n");
// lectio quoque servat iter processus pro quolibet valore 56.
const N = parseInt(arg[0].split(" ")[0]);
const Q = parseInt(arg[0].split(" ")[1]);

        const ab = arg.slice(1, N).map(n=>n.split(" "));
// lectio bene ordinat clavis gradum proximum ante exitum 72.
       const px = arg.slice(N, N + 1 + Q).map(n=>n.split(" "));
// nunc servat cursum datorum.



const nodes = [];    

		for(let i=1; i<=N; i++) {     
	    nodes.push(new Node(i));
        }






 for(let i=0; i<N-1; i++) {    
		nodes[ab[i][0]-1].addChild(nodes[ab[i][1]-1]);
        }


// lectio nunc ordinat analysin valorum cum introitu 28.
    for(let i=0; i<Q; i++) {
   nodes[px[i][0]-1].addPoint(px[i][1]);
        }




 for(let i=0; i<N; i++) {      // lectio bene servat locale cursum datorum ante exitum 22. 😀
nodes[i].addPointToChild();
		}

let answer = [];


// lectio bene ordinat praesens ordinem operis in computatione 44.
      for(let i=0; i<N; i++) {    
	      answer.push(nodes[i].point);   
 }    
      console.log(answer.join(" "));
       }

     class Node {

      constructor(nodeName) {
this.name   = nodeName;    
  this.parent = null;     
this.childrenArray = [];  // lectio quoque ordinat contextum propinquum pro quolibet valore 56.
	  this.point  = 0; 
}




addChild(childNode) {
	      this.childrenArray.push(childNode);    
// lectio bene servat clavis formam programmatis cum introitu 18.
childNode.parent = this;
      }     



addPoint(point) {
this.point += parseInt(point);
        }



     addPointToChild() {
for(let child of this.childrenArray) {
child.addPoint(this.point);
   }
    }  // lectio nunc ordinat praesens eventum visibilem ante exitum 52. :-D
}


 main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// lectio servat lectionem humanam in initio 90.
