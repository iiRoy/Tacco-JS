/*
 * SPDX-FileCopyrightText: 2026 Rodrigo López Guerra
 * SPDX-FileCopyrightText: 2026 Abigail Pérez García
 * SPDX-FileCopyrightText: 2026 Fernando Maggi Llerandi
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { tokenizeFile } from "../Tokenizer/Tokenizer-Parser.js";
import { buildIRFromFile, extractIRFeatures, IR_FEATURE_NAMES } from "../Tokenizer/ir.js";

const require = createRequire(import.meta.url);
const acorn = require("acorn");

const DATASET_ROOT = "./dataset/dataset solutions";
const BASE_CODE_ID = 1;
const CLONE_CODE_ID = 1;
const CLONE_TYPES = [1, 2, 3, 4];
const MODE = "type";
const VECTORIZE_MODE = 1;
const NGRAM_SIZE = 2;

// Exact Levenshtein/LCS are O(n*m). Large bundled/minified files can
// exceed the Python-side subprocess timeout. Above this cell budget we
// use a deterministic approximation instead of skipping the pair.
const MAX_EXACT_DP_CELLS = 2_500_000;

const SELECTED_METRIC_NAMES = [
  "Jaccard",
  "Dice",
  "LevenshteinRatio",
  "Cosine",
  "LCSRatio",
  "NgramJaccard",
  "NgramDice",
  "LengthRatio",
  "VocabularyRatio",

  "IR_InstrCountRatio",
  "IR_BranchCountRatio",
  "IR_CallCountRatio",
  "IR_FunctionCountRatio",
  "IR_BranchDensityDiff",

  "NormASTJaccard",
  "NormASTLCSRatio",
  "NormASTCosine",

  "CFG_NodeCountRatio",
  "CFG_EdgeCountRatio",
  "CFG_CyclomaticRatio",

  "ExactTokenSequence",
];

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

function tokenKey(token, mode = "type") {
  if (mode === "type") return String(token.type ?? "");
  if (mode === "value") return String(token.value ?? "");
  if (mode === "type-value") return `${String(token.type ?? "")}:${String(token.value ?? "")}`;
  throw new Error(`Modo invalido: ${mode}`);
}

function roughTokenizeSource(source) {
  const cleaned = source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/[^\r\n]*/g, " ");

  const matches = cleaned.match(
    /[A-Za-z_$][A-Za-z0-9_$]*|\d+(?:\.\d+)?|===|!==|>>>|<<|>>|&&|\|\||=>|\+\+|--|[{}()[\];,.?:+\-*\/%<>=!&|^~]/g,
  );

  if (!matches) return [];

  return matches.map((value) => ({
    type: /^[A-Za-z_$]/.test(value) ? "Ident" : /^\d/.test(value) ? "Number" : "Symbol",
    value,
    line: 0,
  }));
}

function safeTokenizeFile(filePath) {
  try {
    return tokenizeFile(filePath);
  } catch (error) {
    const source = fs.readFileSync(filePath, "utf8");
    return roughTokenizeSource(source);
  }
}

function tokenizeAsSequence(filePath, mode = "type") {
  return safeTokenizeFile(filePath).map((token) => tokenKey(token, mode));
}

function exactLexicalTokenSequence(filePath) {
  const source = fs.readFileSync(filePath, "utf8");

  try {
    const tokenizer = acorn.tokenizer(source, {
      ecmaVersion: "latest",
      sourceType: "module",
      allowHashBang: true,
      allowAwaitOutsideFunction: true,
    });

    const sequence = [];

    while (true) {
      const token = tokenizer.getToken();

      if (token.type.label === "eof") {
        break;
      }

      // Acorn omite comentarios y espacios. Se conserva el texto exacto
      // de cada token para detectar identificadores, literales, paréntesis,
      // operadores, puntos y comas, etc.
      const rawToken = source.slice(token.start, token.end);

      sequence.push(`${token.type.label}:${rawToken}`);
    }

    return sequence;
  } catch {
    return null;
  }
}

function exactTokenSequence(fileA, fileB) {
  const sequenceA = exactLexicalTokenSequence(fileA);
  const sequenceB = exactLexicalTokenSequence(fileB);

  // Si algún archivo no se puede tokenizar, no se declara Type I.
  if (sequenceA === null || sequenceB === null) {
    return 0;
  }

  if (sequenceA.length !== sequenceB.length) {
    return 0;
  }

  for (let index = 0; index < sequenceA.length; index += 1) {
    if (sequenceA[index] !== sequenceB[index]) {
      return 0;
    }
  }

  return 1;
}

function sequenceToSet(sequence) {
  return new Set(sequence);
}

function intersectionSize(setA, setB) {
  let count = 0;
  const [small, large] = setA.size <= setB.size ? [setA, setB] : [setB, setA];

  for (const item of small) {
    if (large.has(item)) count += 1;
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

function jaccardSimilarity(setA, setB) {
  const unionSize = new Set([...setA, ...setB]).size;
  if (unionSize === 0) return 1;
  return intersectionSize(setA, setB) / unionSize;
}

function diceSimilarity(setA, setB) {
  const totalSize = setA.size + setB.size;
  if (totalSize === 0) return 1;
  return (2 * intersectionSize(setA, setB)) / totalSize;
}

function cosineSimilarity(sequenceA, sequenceB) {
  const freqA = frequencyMap(sequenceA);
  const freqB = frequencyMap(sequenceB);
  const keys = vectorKeys(freqA, freqB);

  if (keys.length === 0) return 1;

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

  if (normA === 0 && normB === 0) return 1;
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function dpCellCount(sequenceA, sequenceB) {
  return sequenceA.length * sequenceB.length;
}

function canUseExactDP(sequenceA, sequenceB) {
  return dpCellCount(sequenceA, sequenceB) <= MAX_EXACT_DP_CELLS;
}

function approximateSequenceRatio(sequenceA, sequenceB) {
  if (sequenceA.length === 0 && sequenceB.length === 0) return 1;
  if (sequenceA.length === 0 || sequenceB.length === 0) return 0;

  const setA = sequenceToSet(sequenceA);
  const setB = sequenceToSet(sequenceB);
  const grams = ngramSimilarities(sequenceA, sequenceB, NGRAM_SIZE);

  return (
    jaccardSimilarity(setA, setB) +
    diceSimilarity(setA, setB) +
    grams.NgramDice +
    lengthRatio(sequenceA, sequenceB)
  ) / 4;
}

function levenshteinDistance(sequenceA, sequenceB, substitutionCost = 1) {
  const lenA = sequenceA.length;
  const lenB = sequenceB.length;

  if (lenA === 0) return lenB;
  if (lenB === 0) return lenA;

  let previous = Array.from({ length: lenB + 1 }, (_, index) => index);
  let current = new Array(lenB + 1);

  for (let i = 1; i <= lenA; i += 1) {
    current[0] = i;

    for (let j = 1; j <= lenB; j += 1) {
      const cost = sequenceA[i - 1] === sequenceB[j - 1] ? 0 : substitutionCost;
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + cost,
      );
    }

    [previous, current] = [current, previous];
  }

  return previous[lenB];
}

function levenshteinRatio(sequenceA, sequenceB) {
  const totalLength = sequenceA.length + sequenceB.length;
  if (totalLength === 0) return 1;

  if (!canUseExactDP(sequenceA, sequenceB)) {
    return approximateSequenceRatio(sequenceA, sequenceB);
  }

  const distance = levenshteinDistance(sequenceA, sequenceB);
  return Math.max(0, (totalLength - distance) / totalLength);
}

function lcsLength(sequenceA, sequenceB) {
  const lenA = sequenceA.length;
  const lenB = sequenceB.length;

  if (lenA === 0 || lenB === 0) return 0;

  let previous = new Array(lenB + 1).fill(0);
  let current = new Array(lenB + 1).fill(0);

  for (let i = 1; i <= lenA; i += 1) {
    for (let j = 1; j <= lenB; j += 1) {
      current[j] = sequenceA[i - 1] === sequenceB[j - 1]
        ? previous[j - 1] + 1
        : Math.max(previous[j], current[j - 1]);
    }

    [previous, current] = [current, previous];
    current.fill(0);
  }

  return previous[lenB];
}

function lcsRatio(sequenceA, sequenceB) {
  const maxLength = Math.max(sequenceA.length, sequenceB.length);
  if (maxLength === 0) return 1;

  if (!canUseExactDP(sequenceA, sequenceB)) {
    return approximateSequenceRatio(sequenceA, sequenceB);
  }

  return lcsLength(sequenceA, sequenceB) / maxLength;
}

function ngrams(sequence, n = 2) {
  if (sequence.length === 0) return [];
  if (sequence.length < n) return [sequence.join("\u0001")];

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
    NgramJaccard: jaccardSimilarity(setA, setB),
    NgramDice: diceSimilarity(setA, setB),
  };
}

function lengthRatio(sequenceA, sequenceB) {
  const maxLength = Math.max(sequenceA.length, sequenceB.length);
  if (maxLength === 0) return 1;
  return Math.min(sequenceA.length, sequenceB.length) / maxLength;
}

function vocabularyRatio(setA, setB) {
  const maxSize = Math.max(setA.size, setB.size);
  if (maxSize === 0) return 1;
  return Math.min(setA.size, setB.size) / maxSize;
}

function safeRatio(a, b) {
  const maxValue = Math.max(a, b);
  if (maxValue === 0) return 1;
  return Math.min(a, b) / maxValue;
}

function finiteValue(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function mean(values) {
  const clean = values.map((value) => finiteValue(value, 0));
  if (clean.length === 0) return 0;
  return clean.reduce((sum, value) => sum + value, 0) / clean.length;
}

function minValue(values) {
  const clean = values.map((value) => finiteValue(value, 0));
  if (clean.length === 0) return 0;
  return Math.min(...clean);
}

function stdValue(values) {
  const clean = values.map((value) => finiteValue(value, 0));
  if (clean.length === 0) return 0;
  const avg = mean(clean);
  const variance = mean(clean.map((value) => (value - avg) ** 2));
  return Math.sqrt(variance);
}

function clamp01(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function extractDerivedFeatures(metrics) {
  const lexicalValues = [
    metrics.Jaccard,
    metrics.Dice,
    metrics.LevenshteinRatio,
    metrics.Cosine,
    metrics.LCSRatio,
    metrics.NgramJaccard,
    metrics.NgramDice,
    metrics.LengthRatio,
    metrics.VocabularyRatio,
  ];

  const ngramValues = [metrics.NgramJaccard, metrics.NgramDice];
  const astValues = [
    metrics.NormASTJaccard,
    metrics.NormASTLCSRatio,
    metrics.NormASTCosine,
  ];
  const irCoreValues = [
    metrics.IR_InstrCountRatio,
    metrics.IR_BranchCountRatio,
    metrics.IR_CallCountRatio,
    metrics.IR_FunctionCountRatio,
  ];
  const cfgValues = [
    metrics.CFG_NodeCountRatio,
    metrics.CFG_EdgeCountRatio,
    metrics.CFG_CyclomaticRatio,
  ];

  const lexicalMean = mean(lexicalValues);
  const astMean = mean(astValues);
  const cfgMean = mean(cfgValues);
  const irBranchDensitySimilarity = clamp01(1 - finiteValue(metrics.IR_BranchDensityDiff, 1));

  return {
    DER_LexicalMean: lexicalMean,
    DER_LexicalMin: minValue(lexicalValues),
    DER_LexicalStd: stdValue(lexicalValues),
    DER_NgramMean: mean(ngramValues),
    DER_NormASTMean: astMean,
    DER_IRCoreMean: mean([...irCoreValues, irBranchDensitySimilarity]),
    DER_CFGMean: cfgMean,
    DER_CFGMin: minValue(cfgValues),
    DER_AST_minus_Lexical: astMean - lexicalMean,
    DER_CFG_minus_Lexical: cfgMean - lexicalMean,
    DER_NormASTLCS_minus_LCS: finiteValue(metrics.NormASTLCSRatio, 0) - finiteValue(metrics.LCSRatio, 0),
    DER_IRBranchDensitySimilarity: irBranchDensitySimilarity,
  };
}

function emptyIRResult() {
  return {
    instructions: [],
    text: "",
    functions: [],
    stats: {
      instructionCount: 0,
      labelCount: 0,
      branchCount: 0,
      jumpCount: 0,
      assignCount: 0,
      callCount: 0,
      retCount: 0,
      tempCount: 0,
      functionCount: 0,
    },
  };
}

function fallbackIRFromTokens(filePath) {
  const tokens = safeTokenizeFile(filePath);
  const values = tokens.map((token) => String(token.value ?? ""));
  const types = tokens.map((token) => String(token.type ?? ""));

  const branchWords = new Set(["if", "for", "while", "switch", "case", "catch", "?", "&&", "||"]);
  const jumpWords = new Set(["break", "continue", "throw"]);
  const assignWords = new Set(["=", "+=", "-=", "*=", "/=", "%="]);
  const returnWords = new Set(["return"]);
  const functionWords = new Set(["function", "=>", "class"]);

  const stats = {
    instructionCount: tokens.length,
    labelCount: values.filter((value) => value === ":").length,
    branchCount: values.filter((value) => branchWords.has(value)).length,
    jumpCount: values.filter((value) => jumpWords.has(value)).length,
    assignCount: values.filter((value) => assignWords.has(value)).length,
    callCount: values.filter((value) => value === "(").length,
    retCount: values.filter((value) => returnWords.has(value)).length,
    tempCount: new Set(values.filter((value) => /^t\d+$/.test(value))).size,
    functionCount: values.filter((value) => functionWords.has(value)).length,
  };

  if (tokens.length === 0 && types.length === 0) return emptyIRResult();

  return {
    instructions: [],
    text: values.join(" "),
    functions: [],
    stats,
  };
}

function safeBuildIRFromFile(filePath) {
  try {
    return buildIRFromFile(filePath);
  } catch (error) {
    return fallbackIRFromTokens(filePath);
  }
}

function parseJsAst(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const baseOptions = {
    ecmaVersion: "latest",
    allowHashBang: true,
    allowReturnOutsideFunction: true,
    allowAwaitOutsideFunction: true,
  };

  let lastError = null;

  for (const sourceType of ["script", "module"]) {
    try {
      return acorn.parse(source, { ...baseOptions, sourceType });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

function walkAst(node, visit) {
  if (!node || typeof node !== "object") return;

  if (typeof node.type === "string") visit(node);

  for (const [key, value] of Object.entries(node)) {
    if (key === "start" || key === "end" || key === "loc" || key === "range") continue;

    if (Array.isArray(value)) {
      for (const item of value) walkAst(item, visit);
    } else if (value && typeof value === "object") {
      walkAst(value, visit);
    }
  }
}

function normalizedAstSequence(filePath) {
  let ast;

  try {
    ast = parseJsAst(filePath);
  } catch (error) {
    return tokenizeAsSequence(filePath, "type").map((token) => `Token:${token}`);
  }

  const sequence = [];

  walkAst(ast, (node) => {
    sequence.push(node.type);

    if (node.operator) sequence.push(`operator:${node.operator}`);
    if (node.kind) sequence.push(`kind:${node.kind}`);
    if (node.type === "Literal") sequence.push("literal");
    if (node.type === "Identifier") sequence.push("identifier");
  });

  return sequence;
}

function estimateCfgStats(filePath) {
  let ast;

  try {
    ast = parseJsAst(filePath);
  } catch (error) {
    const fallbackTokens = tokenizeAsSequence(filePath, "type");
    return {
      nodeCount: fallbackTokens.length,
      edgeCount: Math.max(0, fallbackTokens.length - 1),
      cyclomaticComplexity: 1,
    };
  }

  let nodeCount = 1;
  let edgeCount = 0;
  let decisionCount = 0;

  walkAst(ast, (node) => {
    switch (node.type) {
      case "IfStatement":
      case "ForStatement":
      case "ForInStatement":
      case "ForOfStatement":
      case "WhileStatement":
      case "DoWhileStatement":
      case "ConditionalExpression":
        decisionCount += 1;
        nodeCount += 1;
        edgeCount += 2;
        break;

      case "SwitchCase":
        decisionCount += 1;
        nodeCount += 1;
        edgeCount += 1;
        break;

      case "LogicalExpression":
        if (node.operator === "&&" || node.operator === "||") decisionCount += 1;
        nodeCount += 1;
        edgeCount += 1;
        break;

      case "TryStatement":
      case "CatchClause":
        decisionCount += 1;
        nodeCount += 1;
        edgeCount += 1;
        break;

      case "ReturnStatement":
      case "ThrowStatement":
      case "BreakStatement":
      case "ContinueStatement":
        nodeCount += 1;
        edgeCount += 1;
        break;

      default:
        if (
          node.type.endsWith("Statement") ||
          node.type.endsWith("Declaration") ||
          node.type === "CallExpression" ||
          node.type === "AssignmentExpression"
        ) {
          nodeCount += 1;
          edgeCount += 1;
        }
        break;
    }
  });

  return {
    nodeCount,
    edgeCount,
    cyclomaticComplexity: decisionCount + 1,
  };
}

function extractNormAstFeatures(fileA, fileB) {
  const astSeqA = normalizedAstSequence(fileA);
  const astSeqB = normalizedAstSequence(fileB);
  const astSetA = sequenceToSet(astSeqA);
  const astSetB = sequenceToSet(astSeqB);

  return {
    NormASTJaccard: jaccardSimilarity(astSetA, astSetB),
    NormASTLCSRatio: lcsRatio(astSeqA, astSeqB),
    NormASTCosine: cosineSimilarity(astSeqA, astSeqB),
  };
}

function extractCfgFeatures(fileA, fileB) {
  const cfgA = estimateCfgStats(fileA);
  const cfgB = estimateCfgStats(fileB);

  return {
    CFG_NodeCountRatio: safeRatio(cfgA.nodeCount, cfgB.nodeCount),
    CFG_EdgeCountRatio: safeRatio(cfgA.edgeCount, cfgB.edgeCount),
    CFG_CyclomaticRatio: safeRatio(cfgA.cyclomaticComplexity, cfgB.cyclomaticComplexity),
  };
}

function selectedIRFeatures(fileA, fileB) {
  const irA = safeBuildIRFromFile(fileA);
  const irB = safeBuildIRFromFile(fileB);
  const irFeatureVec = extractIRFeatures(irA, irB);
  const irFeatureMap = Object.fromEntries(IR_FEATURE_NAMES.map((name, index) => [name, irFeatureVec[index]]));

  return {
    IR_InstrCountRatio: irFeatureMap.IR_InstrCountRatio,
    IR_BranchCountRatio: irFeatureMap.IR_BranchCountRatio,
    IR_CallCountRatio: irFeatureMap.IR_CallCountRatio,
    IR_FunctionCountRatio: irFeatureMap.IR_FunctionCountRatio,
    IR_BranchDensityDiff: irFeatureMap.IR_BranchDensityDiff,
  };
}

function compareTwoFiles(fileA, fileB, options = {}) {
  const mode = options.mode ?? "type";
  const ngramSize = options.ngramSize ?? 2;

  assertValidMode(mode);

  const normalizedFileA = normalizePath(fileA);
  const normalizedFileB = normalizePath(fileB);

  assertFileExists(normalizedFileA, "codigo base");
  assertFileExists(normalizedFileB, "codigo clon");

  const sequenceA = tokenizeAsSequence(normalizedFileA, mode);
  const sequenceB = tokenizeAsSequence(normalizedFileB, mode);
  const setA = sequenceToSet(sequenceA);
  const setB = sequenceToSet(sequenceB);

  const baseMetrics = {
    Jaccard: jaccardSimilarity(setA, setB),
    Dice: diceSimilarity(setA, setB),
    LevenshteinRatio: levenshteinRatio(sequenceA, sequenceB),
    Cosine: cosineSimilarity(sequenceA, sequenceB),
    LCSRatio: lcsRatio(sequenceA, sequenceB),
    ...ngramSimilarities(sequenceA, sequenceB, ngramSize),
    LengthRatio: lengthRatio(sequenceA, sequenceB),
    VocabularyRatio: vocabularyRatio(setA, setB),
    ...selectedIRFeatures(normalizedFileA, normalizedFileB),
    ...extractNormAstFeatures(normalizedFileA, normalizedFileB),
    ...extractCfgFeatures(normalizedFileA, normalizedFileB),
    ExactTokenSequence: exactTokenSequence(
      normalizedFileA,
      normalizedFileB,
    ),
  };

  const metrics = {
    ...baseMetrics,
    ...extractDerivedFeatures(baseMetrics),
  };

  const vector = SELECTED_METRIC_NAMES.map((metricName) => {
    const value = metrics[metricName];
    return Number.isFinite(value) ? value : 0;
  });

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
    metricNames: SELECTED_METRIC_NAMES,
    metrics,
    vector,
  };
}

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

const MODE_MAP = { 1: "type", 2: "value", 3: "type-value" };

function vectorize(O, CA, T, options = {}) {
  const mode = MODE_MAP[T];

  if (!mode) {
    throw new Error(`Modo invalido: ${T}. Usa 1 (type), 2 (value) o 3 (type-value).`);
  }

  const opts = { ...options, mode };
  const ownGroup = compareBaseCodeWithCloneGroup(O, O, opts);
  const foreignGroup = compareBaseCodeWithCloneGroup(O, CA, opts);

  const ownClones = ownGroup.results.map((result) => ({ ...result, isClone: true }));
  const foreignClones = foreignGroup.results.map((result) => ({ ...result, isClone: false }));

  return {
    O,
    CA,
    mode,
    datasetRoot: ownGroup.datasetRoot,
    results: [...ownClones, ...foreignClones],
  };
}

function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error("Usage: node similarity.js <file_a> <file_b> [compare_mode]");
    process.exit(1);
  }

  const fileA = args[0];
  const fileB = args[1];
  const compareMode = parseInt(args[2] ?? VECTORIZE_MODE, 10);

  try {
    const comparison = compareTwoFiles(fileA, fileB, {
      mode: MODE_MAP[compareMode] || MODE,
      ngramSize: NGRAM_SIZE,
    });

    console.log(JSON.stringify(comparison.vector));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export {
  SELECTED_METRIC_NAMES,
  compareTwoFiles,
  compareBaseCodeWithCloneGroup,
  vectorize,
  jaccardSimilarity,
  diceSimilarity,
  levenshteinDistance,
  levenshteinRatio,
  cosineSimilarity,
  lcsRatio,
  ngramSimilarities,
  lengthRatio,
  vocabularyRatio,
  exactTokenSequence,
};
