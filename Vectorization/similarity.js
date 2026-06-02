import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { tokenizeFile, buildAST, normalizeAST } from "../Tokenizer/Tokenizer-Parser.js";
import { buildIRFromFile, extractIRFeatures, IR_FEATURE_NAMES,
         extractCFGFeatures, CFG_FEATURE_NAMES } from "../Tokenizer/ir.js";

/*
  ============================================================
  CONFIGURACION PRINCIPAL
  ============================================================

  DATASET_ROOT debe ser la carpeta que contiene directamente:
  - js_files/
  - clones/

  Ejemplo:
  /home/rodrigo/Documentos/Github/Tacco-JS/dataset/dataset general
*/

const DATASET_ROOT = "./dataset/dataset general";

/*
  BASE_CODE_ID:
    Codigo base ubicado en js_files.

  CLONE_CODE_ID:
    Codigo al que pertenecen los clones ubicados en clones.

  Ejemplo:
    BASE_CODE_ID = 2
    CLONE_CODE_ID = 3

  Compara:
    js_files/2.js
    contra:
    clones/3_clon_1.js
    clones/3_clon_2.js
    clones/3_clon_3.js
    clones/3_clon_4.js
*/

const BASE_CODE_ID = 1;
const CLONE_CODE_ID = 1;

/*
  Tipos de clones a comparar.
*/

const CLONE_TYPES = [1, 2, 3, 4];

/*
  mode:
  - "type": compara tipos de token
  - "value": compara valores reales de token
  - "type-value": compara tipo y valor
*/

const MODE = "type";
const VECTORIZE_MODE = 1;

/*
  Parametros de modelos.
*/

const NGRAM_SIZE = 2;
const MINKOWSKI_P = 3;
const SIGMA = "auto";

/*
  ============================================================
  VALIDACIONES Y UTILIDADES
  ============================================================
*/

function normalizePath(filePath) {
  return path.resolve(filePath);
}

function assertFileExists(filePath, label = "archivo") {
  if (!fs.existsSync(filePath)) {
    throw new Error(`No existe el ${label}: ${filePath}`);
  }

  const stat = fs.statSync(filePath);

  if (!stat.isFile()) {
    throw new Error(`La ruta del ${label} no es un archivo: ${filePath}`);
  }
}

function assertDirectoryExists(dirPath, label = "directorio") {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`No existe el ${label}: ${dirPath}`);
  }

  const stat = fs.statSync(dirPath);

  if (!stat.isDirectory()) {
    throw new Error(`La ruta del ${label} no es un directorio: ${dirPath}`);
  }
}

function assertValidMode(mode) {
  const validModes = new Set(["type", "value", "type-value"]);

  if (!validModes.has(mode)) {
    throw new Error(`Modo invalido: ${mode}. Usa "type", "value" o "type-value".`);
  }
}

function buildBaseCodePath(datasetRoot, baseCodeId) {
  return path.join(datasetRoot, "js_files", `${baseCodeId}.js`);
}

function buildCloneCodePath(datasetRoot, cloneCodeId, cloneType) {
  return path.join(datasetRoot, "clones", `${cloneCodeId}_clon_${cloneType}.js`);
}

/*
  ============================================================
  TOKENIZACION
  ============================================================
*/

function tokenKey(token, mode = "type") {
  if (mode === "type") {
    return String(token.type ?? "");
  }

  if (mode === "value") {
    return String(token.value ?? "");
  }

  if (mode === "type-value") {
    return `${String(token.type ?? "")}:${String(token.value ?? "")}`;
  }

  throw new Error(`Modo invalido: ${mode}`);
}

function tokenizeAsSequence(filePath, mode = "type") {
  return tokenizeFile(filePath).map((token) => tokenKey(token, mode));
}

/*
  ============================================================
  FUNCIONES AUXILIARES
  ============================================================
*/

function sequenceToSet(sequence) {
  return new Set(sequence);
}

function intersectionSize(setA, setB) {
  let count = 0;

  const [small, large] =
    setA.size <= setB.size ? [setA, setB] : [setB, setA];

  for (const item of small) {
    if (large.has(item)) {
      count += 1;
    }
  }

  return count;
}

function frequencyMap(sequence) {
  const map = new Map();

  for (const item of sequence) {
    map.set(item, (map.get(item) ?? 0) + 1);
  }

  return map;
}

function vectorKeys(mapA, mapB) {
  return Array.from(new Set([...mapA.keys(), ...mapB.keys()]));
}

function binaryVectorsFromSets(setA, setB) {
  const vocabulary = Array.from(new Set([...setA, ...setB]));

  return {
    vocabulary,
    vectorA: vocabulary.map((token) => (setA.has(token) ? 1 : 0)),
    vectorB: vocabulary.map((token) => (setB.has(token) ? 1 : 0)),
  };
}

/*
  ============================================================
  MODELOS DE SIMILITUD
  ============================================================
*/

//JACCARD SIMILARITY
function jaccardSimilarity(setA, setB) {
  const unionSize = new Set([...setA, ...setB]).size;

  if (unionSize === 0) {
    return 1;
  }

  return intersectionSize(setA, setB) / unionSize;
}

//DICE SIMILARITY
function diceSimilarity(setA, setB) {
  const totalSize = setA.size + setB.size;

  if (totalSize === 0) {
    return 1;
  }

  return (2 * intersectionSize(setA, setB)) / totalSize;
}

//OVERLAP COEFFICIENT
function overlapCoefficient(setA, setB) {
  const minSize = Math.min(setA.size, setB.size);

  if (minSize === 0) {
    return setA.size === setB.size ? 1 : 0;
  }

  return intersectionSize(setA, setB) / minSize;
}

//COSINE SIMILARITY
function cosineSimilarity(sequenceA, sequenceB) {
  const freqA = frequencyMap(sequenceA);
  const freqB = frequencyMap(sequenceB);
  const keys = vectorKeys(freqA, freqB);

  if (keys.length === 0) {
    return 1;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const key of keys) {
    const a = freqA.get(key) ?? 0;
    const b = freqB.get(key) ?? 0;

    dot += a * b;
    normA += a * a;
    normB += b * b;
  }

  if (normA === 0 && normB === 0) {
    return 1;
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

//LEVENSHTEIN DISTANCE
function levenshteinDistance(sequenceA, sequenceB, substitutionCost = 1) {
  const lenA = sequenceA.length;
  const lenB = sequenceB.length;

  if (lenA === 0) {
    return lenB;
  }

  if (lenB === 0) {
    return lenA;
  }

  let previous = Array.from({ length: lenB + 1 }, (_, index) => index);
  let current = new Array(lenB + 1);

  for (let i = 1; i <= lenA; i += 1) {
    current[0] = i;

    for (let j = 1; j <= lenB; j += 1) {
      const cost = sequenceA[i - 1] === sequenceB[j - 1] ? 0 : substitutionCost;

      current[j] = Math.min(
        previous[j] + 1, //eliminar
        current[j - 1] + 1, //insertar
        previous[j - 1] + cost, // mantener o sustituir
      );
    }

    [previous, current] = [current, previous];
  }

  return previous[lenB];
}

//LEVENSHTEIN RATIO
function levenshteinRatio(sequenceA, sequenceB) {
  const totalLength = sequenceA.length + sequenceB.length;

  if (totalLength === 0) {
    return 1;
  }

  const distance = levenshteinDistance(sequenceA, sequenceB);

  return Math.max(0, (totalLength - distance) / totalLength);
}

//JARO SIMILARITY
function jaroSimilarity(sequenceA, sequenceB) {
  const lenA = sequenceA.length;
  const lenB = sequenceB.length;

  if (lenA === 0 && lenB === 0) {
    return 1;
  }

  if (lenA === 0 || lenB === 0) {
    return 0;
  }

  if (
    lenA === lenB &&
    sequenceA.every((value, index) => value === sequenceB[index])
  ) {
    return 1;
  }

  const matchDistance = Math.max(Math.floor(Math.max(lenA, lenB) / 2) - 1, 0);

  const matchedA = new Array(lenA).fill(false);
  const matchedB = new Array(lenB).fill(false);

  let matches = 0;

  for (let i = 0; i < lenA; i += 1) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, lenB);

    for (let j = start; j < end; j += 1) {
      if (matchedB[j]) {
        continue;
      }

      if (sequenceA[i] !== sequenceB[j]) {
        continue;
      }

      matchedA[i] = true;
      matchedB[j] = true;
      matches += 1;
      break;
    }
  }

  if (matches === 0) {
    return 0;
  }

  const matchedSequenceA = [];
  const matchedSequenceB = [];

  for (let i = 0; i < lenA; i += 1) {
    if (matchedA[i]) {
      matchedSequenceA.push(sequenceA[i]);
    }
  }

  for (let j = 0; j < lenB; j += 1) {
    if (matchedB[j]) {
      matchedSequenceB.push(sequenceB[j]);
    }
  }

  let transpositions = 0;

  for (let i = 0; i < matchedSequenceA.length; i += 1) {
    if (matchedSequenceA[i] !== matchedSequenceB[i]) {
      transpositions += 1;
    }
  }

  transpositions /= 2;

  return (
    matches / lenA +
    matches / lenB +
    (matches - transpositions) / matches
  ) / 3;
}

//COMMON PREFIX LENGTH (JARO-WINKLER)
function commonPrefixLength(sequenceA, sequenceB, maxPrefixLength = 4) {
  const limit = Math.min(maxPrefixLength, sequenceA.length, sequenceB.length);

  for (let index = 0; index < limit; index += 1) {
    if (sequenceA[index] !== sequenceB[index]) {
      return index;
    }
  }

  return limit;
}

//JARO-WINKER SIMILARITY
function jaroWinklerSimilarity(
  sequenceA,
  sequenceB,
  prefixScale = 0.1,
  maxPrefixLength = 4,
) {
  const jaro = jaroSimilarity(sequenceA, sequenceB);
  const prefixLength = commonPrefixLength(sequenceA, sequenceB, maxPrefixLength);
  const safePrefixScale = Math.min(Math.max(prefixScale, 0), 0.25);

  return jaro + prefixLength * safePrefixScale * (1 - jaro);
}

//LCS Length
function lcsLength(sequenceA, sequenceB) {
  const lenA = sequenceA.length;
  const lenB = sequenceB.length;

  if (lenA === 0 || lenB === 0) {
    return 0;
  }

  let previous = new Array(lenB + 1).fill(0);
  let current = new Array(lenB + 1).fill(0);

  for (let i = 1; i <= lenA; i += 1) {
    for (let j = 1; j <= lenB; j += 1) {
      if (sequenceA[i - 1] === sequenceB[j - 1]) {
        current[j] = previous[j - 1] + 1;
      } else {
        current[j] = Math.max(previous[j], current[j - 1]);
      }
    }

    [previous, current] = [current, previous];
    current.fill(0);
  }

  return previous[lenB];
}

function lcsDistance(sequenceA, sequenceB) {
  return sequenceA.length + sequenceB.length - 2 * lcsLength(sequenceA, sequenceB);
}

function lcsRatio(sequenceA, sequenceB) {
  const maxLength = Math.max(sequenceA.length, sequenceB.length);

  if (maxLength === 0) {
    return 1;
  }

  return lcsLength(sequenceA, sequenceB) / maxLength;
}

function ngrams(sequence, n = 2) {
  if (sequence.length === 0) {
    return [];
  }

  if (sequence.length < n) {
    return [sequence.join("\u0001")];
  }

  const grams = [];

  for (let i = 0; i <= sequence.length - n; i += 1) {
    grams.push(sequence.slice(i, i + n).join("\u0001"));
  }

  return grams;
}

function ngramSimilarities(sequenceA, sequenceB, n = 2) {
  const setA = sequenceToSet(ngrams(sequenceA, n));
  const setB = sequenceToSet(ngrams(sequenceB, n));

  return {
    ngramJaccardSimilarity: jaccardSimilarity(setA, setB),
    ngramDiceSimilarity: diceSimilarity(setA, setB),
  };
}

function manhattanDistance(vectorA, vectorB) {
  let distance = 0;

  for (let i = 0; i < vectorA.length; i += 1) {
    distance += Math.abs(vectorA[i] - vectorB[i]);
  }

  return distance;
}

function euclideanDistance(vectorA, vectorB) {
  let sum = 0;

  for (let i = 0; i < vectorA.length; i += 1) {
    const diff = vectorA[i] - vectorB[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

function minkowskiDistance(vectorA, vectorB, p = 3) {
  let sum = 0;

  for (let i = 0; i < vectorA.length; i += 1) {
    sum += Math.abs(vectorA[i] - vectorB[i]) ** p;
  }

  return sum ** (1 / p);
}

function chebyshevDistance(vectorA, vectorB) {
  let maxDifference = 0;

  for (let i = 0; i < vectorA.length; i += 1) {
    maxDifference = Math.max(maxDifference, Math.abs(vectorA[i] - vectorB[i]));
  }

  return maxDifference;
}

function gaussianSimilarity(distance, sigma) {
  if (distance === 0) {
    return 1;
  }

  if (!Number.isFinite(sigma) || sigma <= 0) {
    return 0;
  }

  return Math.exp(-(distance * distance) / (2 * sigma * sigma));
}

function sigmaForDistance(distance, configuredSigma) {
  if (configuredSigma !== "auto") {
    return configuredSigma;
  }

  if (distance === 0) {
    return 1;
  }

  return 0.85 * distance;
}

function lengthRatio(sequenceA, sequenceB) {
  const maxLength = Math.max(sequenceA.length, sequenceB.length);

  if (maxLength === 0) {
    return 1;
  }

  return Math.min(sequenceA.length, sequenceB.length) / maxLength;
}

function vocabularyRatio(setA, setB) {
  const maxSize = Math.max(setA.size, setB.size);

  if (maxSize === 0) {
    return 1;
  }

  return Math.min(setA.size, setB.size) / maxSize;
}

/*
  ============================================================
  AST NORMALIZADO  (identificadores abstraídos → "ID")
  ============================================================
*/

function astNodeSequence(node) {
  if (!node || typeof node !== "object") return [];
  if (Array.isArray(node)) {
    const seq = [];
    for (const child of node) seq.push(...astNodeSequence(child));
    return seq;
  }
  if (typeof node.type !== "string") return [];
  const seq = [node.type];
  for (const key of Object.keys(node)) {
    if (key === "type") continue;
    const child = node[key];
    if (child && typeof child === "object") seq.push(...astNodeSequence(child));
  }
  return seq;
}

function normalizedASTSequence(filePath) {
  try {
    const source = fs.readFileSync(filePath, "utf-8");
    const ast    = buildAST(source);
    const norm   = normalizeAST(ast, "abstract");
    return astNodeSequence(norm);
  } catch (_) {
    return [];
  }
}

function astSimilarities(seqA, seqB) {
  if (seqA.length === 0 && seqB.length === 0) {
    return { normASTJaccard: 1, normASTLCSRatio: 1, normASTCosine: 1 };
  }
  if (seqA.length === 0 || seqB.length === 0) {
    return { normASTJaccard: 0, normASTLCSRatio: 0, normASTCosine: 0 };
  }
  const setA = sequenceToSet(seqA);
  const setB = sequenceToSet(seqB);
  return {
    normASTJaccard:  jaccardSimilarity(setA, setB),
    normASTLCSRatio: lcsRatio(seqA, seqB),
    normASTCosine:   cosineSimilarity(seqA, seqB),
  };
}

/*
  ============================================================
  COMPARACION ENTRE DOS ARCHIVOS
  ============================================================
*/

function compareTwoFiles(fileA, fileB, options = {}) {
  const mode = options.mode ?? "type";
  const ngramSize = options.ngramSize ?? 2;
  const minkowskiP = options.minkowskiP ?? 3;
  const configuredSigma = options.sigma ?? "auto";

  assertValidMode(mode);

  const normalizedFileA = normalizePath(fileA);
  const normalizedFileB = normalizePath(fileB);

  assertFileExists(normalizedFileA, "codigo base");
  assertFileExists(normalizedFileB, "codigo clon");

  const sequenceA = tokenizeAsSequence(normalizedFileA, mode);
  const sequenceB = tokenizeAsSequence(normalizedFileB, mode);

  const setA = sequenceToSet(sequenceA);
  const setB = sequenceToSet(sequenceB);

  const { vectorA, vectorB } = binaryVectorsFromSets(setA, setB);

  const levenshtein = levenshteinDistance(sequenceA, sequenceB);
  const lcsDist = lcsDistance(sequenceA, sequenceB);

  const manhattan = manhattanDistance(vectorA, vectorB);
  const euclidean = euclideanDistance(vectorA, vectorB);
  const minkowski = minkowskiDistance(vectorA, vectorB, minkowskiP);
  const chebyshev = chebyshevDistance(vectorA, vectorB);

  const gaussianManhattanSigma = sigmaForDistance(manhattan, configuredSigma);
  const gaussianEuclideanSigma = sigmaForDistance(euclidean, configuredSigma);
  const gaussianMinkowskiSigma = sigmaForDistance(minkowski, configuredSigma);
  const gaussianChebyshevSigma = sigmaForDistance(chebyshev, configuredSigma);

  // Normalized AST features (identifiers abstracted to "ID")
  const astSeqA   = normalizedASTSequence(normalizedFileA);
  const astSeqB   = normalizedASTSequence(normalizedFileB);
  const astSims   = astSimilarities(astSeqA, astSeqB);

  // IR-based structural features (must be computed before use in metrics/vector)
  const irA           = buildIRFromFile(normalizedFileA);
  const irB           = buildIRFromFile(normalizedFileB);
  const irFeatureVec  = extractIRFeatures(irA, irB);
  const cfgFeatureVec = extractCFGFeatures(irA, irB);

  const irFeatureMap = Object.fromEntries(
    IR_FEATURE_NAMES.map((name, i) => [name, irFeatureVec[i]])
  );
  const cfgFeatureMap = Object.fromEntries(
    CFG_FEATURE_NAMES.map((name, i) => [name, cfgFeatureVec[i]])
  );

  const metrics = {
    jaccardSimilarity: jaccardSimilarity(setA, setB),
    diceSimilarity: diceSimilarity(setA, setB),

    levenshteinDistance: levenshtein,
    levenshteinRatio: levenshteinRatio(sequenceA, sequenceB),

    jaroSimilarity: jaroSimilarity(sequenceA, sequenceB),
    jaroWinklerSimilarity: jaroWinklerSimilarity(sequenceA, sequenceB),

    cosineSimilarity: cosineSimilarity(sequenceA, sequenceB),
    overlapCoefficient: overlapCoefficient(setA, setB),

    lcsDistance: lcsDist,
    lcsRatio: lcsRatio(sequenceA, sequenceB),

    ...ngramSimilarities(sequenceA, sequenceB, ngramSize),

    manhattanDistance: manhattan,
    euclideanDistance: euclidean,
    minkowskiDistance: minkowski,
    chebyshevDistance: chebyshev,

    gaussianManhattanSimilarity: gaussianSimilarity(manhattan, gaussianManhattanSigma),
    gaussianEuclideanSimilarity: gaussianSimilarity(euclidean, gaussianEuclideanSigma),
    gaussianMinkowskiSimilarity: gaussianSimilarity(minkowski, gaussianMinkowskiSigma),
    gaussianChebyshevSimilarity: gaussianSimilarity(chebyshev, gaussianChebyshevSigma),

    lengthRatio: lengthRatio(sequenceA, sequenceB),
    vocabularyRatio: vocabularyRatio(setA, setB),
    ...irFeatureMap,
    normASTJaccard:  astSims.normASTJaccard,
    normASTLCSRatio: astSims.normASTLCSRatio,
    normASTCosine:   astSims.normASTCosine,
    ...cfgFeatureMap,
  };

  const similarityFeatureVector = [
    metrics.jaccardSimilarity,
    metrics.diceSimilarity,
    metrics.levenshteinRatio,
    metrics.jaroSimilarity,
    metrics.jaroWinklerSimilarity,
    metrics.cosineSimilarity,
    metrics.overlapCoefficient,
    metrics.lcsRatio,
    metrics.ngramJaccardSimilarity,
    metrics.ngramDiceSimilarity,
    metrics.gaussianManhattanSimilarity,
    metrics.gaussianEuclideanSimilarity,
    metrics.gaussianMinkowskiSimilarity,
    metrics.gaussianChebyshevSimilarity,
    metrics.lengthRatio,
    metrics.vocabularyRatio,
    ...irFeatureVec,
    metrics.normASTJaccard,
    metrics.normASTLCSRatio,
    metrics.normASTCosine,
    ...cfgFeatureVec,
  ];

  return {
    fileA: normalizedFileA,
    fileB: normalizedFileB,
    mode,
    parameters: {
      ngramSize,
      minkowskiP,
      sigma: configuredSigma,
    },
    tokenStats: {
      fileATokenCount: sequenceA.length,
      fileBTokenCount: sequenceB.length,
      fileAVocabularySize: setA.size,
      fileBVocabularySize: setB.size,
    },
    metrics,
    vector: similarityFeatureVector,
  };
}

/*
  ============================================================
  COMPARACION DE UN CODIGO BASE CONTRA LOS 4 CLONES DE OTRO CODIGO
  ============================================================
*/

function compareBaseCodeWithCloneGroup(baseCodeId, cloneCodeId, options = {}) {
  const datasetRoot = normalizePath(options.datasetRoot ?? DATASET_ROOT);

  const jsFilesDir = path.join(datasetRoot, "js_files");
  const clonesDir = path.join(datasetRoot, "clones");

  assertDirectoryExists(datasetRoot, "dataset");
  assertDirectoryExists(jsFilesDir, "js_files");
  assertDirectoryExists(clonesDir, "clones");

  const baseCodePath = buildBaseCodePath(datasetRoot, baseCodeId);

  assertFileExists(baseCodePath, `codigo base ${baseCodeId}`);

  const cloneResults = CLONE_TYPES.map((cloneType) => {
    const clonePath = buildCloneCodePath(datasetRoot, cloneCodeId, cloneType);

    assertFileExists(clonePath, `clon ${cloneCodeId}_clon_${cloneType}`);

    const comparison = compareTwoFiles(baseCodePath, clonePath, {
      mode: options.mode ?? MODE,
      ngramSize: options.ngramSize ?? NGRAM_SIZE,
      minkowskiP: options.minkowskiP ?? MINKOWSKI_P,
      sigma: options.sigma ?? SIGMA,
    });

    return {
      baseCodeId,
      cloneCodeId,
      cloneType,
      baseCode: baseCodePath,
      cloneCode: clonePath,

      vector: comparison.vector,
      metrics: comparison.metrics,
      tokenStats: comparison.tokenStats,
    };
  });

  return {
    baseCodeId,
    cloneCodeId,
    datasetRoot,
    baseCode: baseCodePath,
    clonesCompared: cloneResults.length,
    cloneTypes: CLONE_TYPES,
    results: cloneResults,
  };
}

/*
  ============================================================
  VECTORIZACION DE UN PAR (O, CA)
  ============================================================
*/

const MODE_MAP = { 1: "type", 2: "value", 3: "type-value" };

function vectorize(O, CA, T, options = {}) {
  const mode = MODE_MAP[T];

  if (!mode) {
    throw new Error(`Modo invalido: ${T}. Usa 1 (type), 2 (value) o 3 (type-value).`);
  }

  const opts = { ...options, mode };

  const ownGroup     = compareBaseCodeWithCloneGroup(O, O,  opts);
  const foreignGroup = compareBaseCodeWithCloneGroup(O, CA, opts);

  const ownClones     = ownGroup.results.map((r)     => ({ ...r, isClone: true  }));
  const foreignClones = foreignGroup.results.map((r) => ({ ...r, isClone: false }));

  return {
    O,
    CA,
    mode,
    datasetRoot: ownGroup.datasetRoot,
    results: [...ownClones, ...foreignClones],
  };
}

/*
  ============================================================
  EJECUCION
  ============================================================
*/

function main() {
  const result = vectorize(1000, 1001, VECTORIZE_MODE, {
    datasetRoot: DATASET_ROOT,
    ngramSize: NGRAM_SIZE,
    minkowskiP: MINKOWSKI_P,
    sigma: SIGMA,
  });

  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export {
  compareTwoFiles,
  compareBaseCodeWithCloneGroup,
  vectorize,

  jaccardSimilarity,
  diceSimilarity,

  levenshteinDistance,
  levenshteinRatio,

  jaroSimilarity,
  jaroWinklerSimilarity,

  cosineSimilarity,
  overlapCoefficient,

  lcsDistance,
  lcsRatio,

  ngramSimilarities,

  manhattanDistance,
  euclideanDistance,
  minkowskiDistance,
  chebyshevDistance,

  gaussianSimilarity,

  lengthRatio,
  vocabularyRatio,
};