import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { tokenizeFile } from "../Tokenizer/Tokenizer-Parser.js";

/*
  ============================================================
  CONFIGURACION PRINCIPAL
  ============================================================
*/

const DATASET_ROOT = "./dataset/dataset general";

const BASE_CODE_ID = 1;
const CLONE_CODE_ID = 1;

const CLONE_TYPES = [1, 2, 3, 4];

/*
  MODE:
  - "type": compara solo tipos de nodo AST
  - "value": compara solo valores normalizados
  - "type-value": compara tipo + valor normalizado

  Recomendado:
  - "type-value"
*/

const MODE = "type-value";
const VECTORIZE_MODE = 3;

const NGRAM_SIZE = 5;

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
  TOKENIZACION BASADA EN PARSER
  ============================================================
*/

function tokenKey(token, mode = "type-value") {
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

function tokenizeAsSequence(filePath, mode = "type-value") {
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

/*
  ============================================================
  JACCARD SIMILARITY
  ============================================================
*/

function jaccardSimilarity(setA, setB) {
  const unionSize = new Set([...setA, ...setB]).size;

  if (unionSize === 0) {
    return 1;
  }

  return intersectionSize(setA, setB) / unionSize;
}

/*
  ============================================================
  DICE SIMILARITY
  ============================================================
*/

function diceSimilarity(setA, setB) {
  const totalSize = setA.size + setB.size;

  if (totalSize === 0) {
    return 1;
  }

  return (2 * intersectionSize(setA, setB)) / totalSize;
}

/*
  ============================================================
  LEVENSHTEIN DISTANCE / RATIO
  ============================================================
*/

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
        previous[j] + 1, // eliminar
        current[j - 1] + 1, // insertar
        previous[j - 1] + cost, // sustituir o mantener
      );
    }

    [previous, current] = [current, previous];
  }

  return previous[lenB];
}

function levenshteinRatio(sequenceA, sequenceB) {
  const maxLength = Math.max(sequenceA.length, sequenceB.length);

  if (maxLength === 0) {
    return 1;
  }

  const distance = levenshteinDistance(sequenceA, sequenceB);

  return Math.max(0, 1 - distance / maxLength);
}

/*
  ============================================================
  LCS DISTANCE / RATIO
  ============================================================
*/

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

/*
  ============================================================
  N-GRAM SIMILARITY
  ============================================================
*/

function ngrams(sequence, n = 5) {
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

function ngramSimilarity(sequenceA, sequenceB, n = 5) {
  const setA = sequenceToSet(ngrams(sequenceA, n));
  const setB = sequenceToSet(ngrams(sequenceB, n));

  return jaccardSimilarity(setA, setB);
}

/*
  ============================================================
  COSINE SIMILARITY
  ============================================================
*/

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

/*
  ============================================================
  LENGTH RATIO / VOCABULARY RATIO
  ============================================================
*/

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
  COMPARACION ENTRE DOS ARCHIVOS
  ============================================================
*/

function compareTwoFiles(fileA, fileB, options = {}) {
  const mode = options.mode ?? MODE;
  const ngramSize = options.ngramSize ?? NGRAM_SIZE;

  assertValidMode(mode);

  const normalizedFileA = normalizePath(fileA);
  const normalizedFileB = normalizePath(fileB);

  assertFileExists(normalizedFileA, "codigo base");
  assertFileExists(normalizedFileB, "codigo comparado");

  const sequenceA = tokenizeAsSequence(normalizedFileA, mode);
  const sequenceB = tokenizeAsSequence(normalizedFileB, mode);

  const setA = sequenceToSet(sequenceA);
  const setB = sequenceToSet(sequenceB);

  const metrics = {
    jaccardSimilarity: jaccardSimilarity(setA, setB),
    diceSimilarity: diceSimilarity(setA, setB),

    levenshteinDistance: levenshteinDistance(sequenceA, sequenceB),
    levenshteinRatio: levenshteinRatio(sequenceA, sequenceB),

    cosineSimilarity: cosineSimilarity(sequenceA, sequenceB),

    lcsDistance: lcsDistance(sequenceA, sequenceB),
    lcsRatio: lcsRatio(sequenceA, sequenceB),

    ngramSimilarity: ngramSimilarity(sequenceA, sequenceB, ngramSize),

    lengthRatio: lengthRatio(sequenceA, sequenceB),
    vocabularyRatio: vocabularyRatio(setA, setB),
  };

  const similarityFeatureVector = [
    metrics.jaccardSimilarity,
    metrics.diceSimilarity,
    metrics.levenshteinDistance,
    metrics.levenshteinRatio,
    metrics.cosineSimilarity,
    metrics.lcsDistance,
    metrics.lcsRatio,
    metrics.ngramSimilarity,
    metrics.lengthRatio,
    metrics.vocabularyRatio,
  ];

  return {
    fileA: normalizedFileA,
    fileB: normalizedFileB,
    mode,
    parameters: {
      ngramSize,
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
  COMPARACION DE UN CODIGO BASE CONTRA CLONES
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

const MODE_MAP = {
  1: "type",
  2: "value",
  3: "type-value",
};

function vectorize(O, CA, T, options = {}) {
  const mode = MODE_MAP[T];

  if (!mode) {
    throw new Error(`Modo invalido: ${T}. Usa 1 (type), 2 (value) o 3 (type-value).`);
  }

  const opts = { ...options, mode };

  const ownGroup = compareBaseCodeWithCloneGroup(O, O, opts);
  const foreignGroup = compareBaseCodeWithCloneGroup(O, CA, opts);

  const ownClones = ownGroup.results.map((result) => ({
    ...result,
    isClone: true,
  }));

  const foreignClones = foreignGroup.results.map((result) => ({
    ...result,
    isClone: false,
  }));

  return {
    O,
    CA,
    mode,
    datasetRoot: ownGroup.datasetRoot,
    vectorDescription: [
      "jaccardSimilarity",
      "diceSimilarity",
      "levenshteinDistance",
      "levenshteinRatio",
      "cosineSimilarity",
      "lcsDistance",
      "lcsRatio",
      "ngramSimilarity",
      "lengthRatio",
      "vocabularyRatio",
    ],
    results: [...ownClones, ...foreignClones],
  };
}

/*
  ============================================================
  EJECUCION
  ============================================================
*/

function main() {
  const result = vectorize(BASE_CODE_ID, CLONE_CODE_ID, VECTORIZE_MODE, {
    datasetRoot: DATASET_ROOT,
    ngramSize: NGRAM_SIZE,
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

  lcsDistance,
  lcsRatio,

  ngramSimilarity,
  cosineSimilarity,

  lengthRatio,
  vocabularyRatio,
};