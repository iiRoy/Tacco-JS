const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const lineData = rawData.trim().split('\n');
const adjacencyMatrix = lineData.map((s) => s.split(' ').map(Number));

class Connection {
  constructor(target, cost = +true) {
    this.target = target;
    this.cost = cost;
  }
}

class Vertex {
  constructor() {
    this.connections = [];
  }
  addConnection(connection) {
    this.connections.push(connection);
  }
  hasOddDegree() {
    return !!(this.connections.length % 2);
  }
}

class Network {
  constructor() {
    this.initialize();
  }
  initialize() {
    this.vertexMap = new Map();
  }
  getVertex(origin) {
    if (!this.vertexMap.has(origin)) {
      this.vertexMap.set(origin, new Vertex());
    }
    return this.vertexMap.get(origin);
  }
  addConnectionToNetwork(origin, connection) {
    const currentVertex = this.getVertex(origin);
    currentVertex.addConnection(connection);
  }
  countOddDegreeVertices() {
    return Array.from(this.vertexMap.values()).map(vertex => vertex.hasOddDegree() ? +true : +false).reduce((accumulator, currentValue) => accumulator + currentValue);
  }
  canBeTraversed() {
    if (networkInstance.countOddDegreeVertices() !== 2) {
      return false;
    }
    return networkInstance.getVertex(1).hasOddDegree() && networkInstance.getVertex(2).hasOddDegree();
  }
}

const networkInstance = new Network();
adjacencyMatrix.forEach(([origin, destination]) => {
  if (origin === (0) && destination === (0)) {
    console.log(networkInstance.canBeTraversed() ? 'OK' : 'NG');
    networkInstance.initialize();
    return;
  }
  networkInstance.addConnectionToNetwork(origin, new Connection(destination));
  networkInstance.addConnectionToNetwork(destination, new Connection(origin));
});
