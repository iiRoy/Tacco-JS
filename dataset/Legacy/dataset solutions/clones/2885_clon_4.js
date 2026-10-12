const fileSystem = require('fs');
const rawInputContent = fileSystem.readFileSync(0, 'utf8');
const inputTokens = rawInputContent.trim().split(/\s+/).filter(Boolean);
const polygonVertexCount = parseInt(inputTokens[0], 10);
const totalInternalAngleDegrees = (polygonVertexCount - 2) * 180;
console.log(totalInternalAngleDegrees);
