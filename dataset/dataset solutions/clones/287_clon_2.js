const     rawData   = require('fs').readFileSync('/dev/stdin', 'utf8') ;

const linesOfText=rawData.trim().split('\n');
const connections=linesOfText.map( (lineStr) => lineStr.split(' ').map(Number) );

class ConnectionLink {
  constructor( targetNodeId, linkCost = 1 ) {
    this.targetNode = targetNodeId;
    this.costValue = linkCost;
  }
}

class Vertex {
  constructor(  ) {
    this.outgoingLinks = [];
  }

  appendLink( newConnection ) {
    this.outgoingLinks.push(newConnection);
  }

  hasOddDegree(  ) {
    return !!(this.outgoingLinks.length % 2);
  }
}

class NetworkStructure {
  constructor() {
    this.initializeStructure();
  }

  initializeStructure(  ) {
    this.vertexRegistry = new Map();
  }

  getVertexReference( originIdentifier, linkObject ) {
    if ( !this.vertexRegistry.has(originIdentifier) ) {
      this.vertexRegistry.set(originIdentifier, new Vertex());
    }
    return this.vertexRegistry.get(originIdentifier);
  }

  appendLinkBetween( originIdentifier, newConnection ) {
    const currentVertex = this.getVertexReference(originIdentifier);
    currentVertex.appendLink(newConnection);
  }

  countOddDegreeVertices(  ) {
    return Array.from(this.vertexRegistry.values()).map(aVertex => aVertex.hasOddDegree() ? 1 : 0).reduce((accumulator, currentValue) => accumulator + currentValue);
  }

  canTraverseEulerianPath(  ) {
    if ( networkInstance.countOddDegreeVertices() !== 2 ) {
      return false;
    }
    return networkInstance.getVertexReference(1).hasOddDegree() && networkInstance.getVertexReference(2).hasOddDegree();
  }
}

const networkInstance = new NetworkStructure();

connections.forEach(  ( [startId, endId] ) => {
  if ( startId === 0 && endId === 0 ) {
    console.log( networkInstance.canTraverseEulerianPath() ? 'OK' : 'NG' );
    networkInstance.initializeStructure();
    return;
  }
  networkInstance.appendLinkBetween( startId, new ConnectionLink(endId) );
  networkInstance.appendLinkBetween( endId, new ConnectionLink(startId) );
} );