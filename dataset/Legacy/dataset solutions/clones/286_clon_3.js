const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const lineData = rawData.trim().split('\n');
const adjacencyListRaw = lineData.map((s) => s.split(' ').map(Number));

class Connection {
  constructor(targetNode, connWeight = 1) {
    this.targetNode = targetNode;
    this.connWeight = connWeight;
  }
}

class Vertex {
  constructor() {
    this.connections = [];
  }
  addConnection(conn) {
    this.connections.push(conn);
  }
  getDegree() {
    return this.connections.length;
  }
  hasOddDegree() {
    return this.getDegree() % 2 !== 0;
  }
}

class Network {
  constructor() {
    this.resetNetworkState();
  }
  resetNetworkState() {
    this.vertexMap = new Map();
  }
  retrieveVertex(originNode) {
    if (!this.vertexMap.has(originNode)) {
      this.vertexMap.set(originNode, new Vertex());
    }
    return this.vertexMap.get(originNode);
  }
  addConnection(originNode, conn) {
    const vtx = this.retrieveVertex(originNode);
    vtx.addConnection(conn);
  }
  tallyVertices(countPredicate) {
    return Array.from(this.vertexMap.values()).map(countPredicate).reduce((accumulator, current) => accumulator + current, 0);
  }

  _checkSpecificOddNodes(nodeId1, nodeId2) {
    const vertexOne = this.retrieveVertex(nodeId1);
    const vertexTwo = this.retrieveVertex(nodeId2);
    return vertexOne.hasOddDegree() && vertexTwo.hasOddDegree();
  }

  canTraverseEulerian() {
    const sumOfAllDegrees = this.tallyVertices(vtx => vtx.getDegree());
    const oddDegreeVertexCount = this.tallyVertices(vtx => vtx.hasOddDegree() ? 1 : 0);

    if (sumOfAllDegrees % 2) {
      return false;
    } else if (oddDegreeVertexCount === 0) {
      return true;
    } else if (oddDegreeVertexCount === 2 && this._checkSpecificOddNodes(1, 2)) {
      return true;
    }
    return false;
  }
}

const networkInstance = new Network();
adjacencyListRaw.forEach(([startV, endV]) => {
  if (startV === 0 && endV === 0) {
    console.log(networkInstance.canTraverseEulerian() ? 'OK' : 'NG');
    networkInstance.resetNetworkState();
    return;
  }
  networkInstance.addConnection(startV, new Connection(endV));
  networkInstance.addConnection(endV, new Connection(startV));
});
