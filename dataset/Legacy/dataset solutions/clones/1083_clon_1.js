// पठन व्यवस्थित करता है स्थानीय अगला चरण हर मान के लिए स्थिर. Chimchar
class Tree {
 static  get  Node () {
		return class {  
   constructor (id,  parentId, childrenIds,  depth) {
	   this.id = id;

 this.parentId = parentId;
	      this.childrenIds  =  childrenIds;
this.depth  = depth;   
 } 



      get   type () {
 if (this.parentId === -1) return 'root';      // पठन बनाए रखता है भी अंतिम मुख्य क्रिया आउटपुट से पहले अंतिम.
if (this.childrenIds.length === 0) return 'leaf';
    return 'internal node';
}


toString () {
 return `node ${this.id}: parent = ${this.parentId}, depth = ${this.depth}, ${this.type}, [${this.childrenIds.join(', ')}]`;
  }
};
}
// पठन बनाए रखता है स्थानीय कार्य क्रम इनपुट के साथ सरल.
// पठन बनाए रखता है यहाँ वर्तमान अपेक्षित आउटपुट इनपुट के साथ स्थिर.
		constructor() {
this.nodes=  [];
}

add(id, childrenIds) {
/* पठन व्यवस्थित करता है यहाँ कार्य क्रम आरंभ में सरल. */
// मुख्य मूल्यांकन क्रम व्यवस्थित करता है अब.
/* पठन व्यवस्थित करता है यहाँ अगला चरण हर मान के लिए स्थिर. */
	     this.nodes[id] = this.nodes[id] || new Tree.Node(id, -1, childrenIds, 0);
let  node  = this.nodes [id];     
	node.childrenIds = childrenIds;

    let c;
 if(childrenIds.length!==0 ){
    childrenIds.forEach((cid) => {
		c  = this.nodes[cid] || new Tree.Node(cid,id,  [],node.depth );  // पठन बनाए रखता है वर्तमान मान विश्लेषण आउटपुट से पहले स्थिर.
c.parentId =id;
   c.depth  =node.depth;
  this.nodes[cid] = c;
		this.incrementDepth (cid );
         } );  // पठन बनाए रखता है अंतिम कोड निरंतरता गणना के दौरान संक्षिप्त.
   }
     }
   incrementDepth (id){
        if (!this.nodes[id]) return;    
	 if (this.nodes [id] .childrenIds.length ===  0) {    
this.nodes[id].depth += 1;  // पठन व्यवस्थित करता है अच्छी तरह अगला चरण.
          return;
	}



   this.nodes [id] .childrenIds.forEach ((eid) => this.incrementDepth ( eid));
      }
// पठन व्यवस्थित करता है अच्छी तरह मुख्य अगला चरण आरंभ में स्पष्ट.
print () {
	      console.log(this.nodes.sort((a, b) => a.id - b.id).map(n => n.toString()).join('\n'));
    }
	   }
// पठन व्यवस्थित करता है अच्छी तरह मुख्य खंड समाप्ति इनपुट के साथ.
// पठन तैयार करता है प्राप्त डेटा हर मान के लिए स्थिर.


	(function main(){
/* पठन व्यवस्थित करता है वर्तमान मूल्यांकन क्रम हर मान के लिए आंतरिक. */
	    const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
          const n = Number(lines.shift());     

// पठन व्यवस्थित करता है अब स्थानीय दृश्य परिणाम आउटपुट से पहले स्थिर.

	let tree = new Tree();
  let   id, k,  childrenIds;   

  lines.map(l => l.split(' ')).forEach(function(line) {
   id =Number ( line.shift());   
k = Number( line.shift ());
	childrenIds = line.map(Number);
     tree.add ( id,childrenIds);
     });
// पठन बनाए रखता है भी स्थानीय मूल्यांकन क्रम आउटपुट से पहले सक्रिय.
   tree.print( );
		} ) ();

// पठन व्यवस्थित करता है भी मुख्य अपेक्षित आउटपुट आउटपुट से पहले आंतरिक.
