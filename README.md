<p align="center">
  <img src="https://github.com/user-attachments/assets/985058b4-4a59-46f3-95d3-842e70cc91a2" alt="TaccoJS Logo" width="400" />
</p>

# Tacco JS

**Token Analyzer for Code Clone Occurrence in JavaScript**

Tacco JS is a JavaScript code-clone detection and implementation-originality analysis tool. It compares pairs of accepted JavaScript submissions and produces an interpretable similarity report instead of an automatic plagiarism accusation.

The project was designed for contexts where several programmers solve the same problem under similar constraints, such as competitive programming, programming education, and technical interviews. In those settings, similar code can come from copying, but it can also come from canonical algorithms, shared preparation resources, or independent convergence toward the same solution strategy.

> [!IMPORTANT]
> Tacco JS reports similarity evidence. It does **not** prove plagiarism, dishonesty, or absolute originality.

---

## What Tacco JS does

Given two JavaScript files, Tacco JS:

1. Tokenizes and normalizes both programs.
2. Builds additional code representations, including normalized AST, IR/TAC, and CFG-derived features.
3. Computes a 20-dimensional pairwise similarity feature vector.
4. Runs a supervised machine learning classifier.
5. Reports the predicted clone type, confidence score, and relative originality interpretation.

The current experimental scope classifies clone pairs into four categories:

| Clone type | Meaning |
|---|---|
| **Type-I** | Near-identical code with formatting, whitespace, or comment changes. |
| **Type-II** | Same structure with renamed identifiers or superficial lexical changes. |
| **Type-III** | Modified clone with added, removed, or changed statements. |
| **Type-IV** | Semantically similar or functionally equivalent code with substantially different implementation. |

---

## Why it exists

Code similarity is difficult to interpret in evaluation environments. A pair of accepted solutions may be highly similar because one was copied, but also because both programmers used the same standard algorithmic strategy. Tacco JS approaches this problem as a **decision-support system**: it flags unusually similar implementations and provides technical evidence for human review.

This makes the tool useful for:

- code clone detection in JavaScript;
- originality analysis between accepted submissions;
- educational programming review;
- competitive programming analysis;
- technical interview support;
- experimentation with token, AST, IR/TAC, and CFG similarity metrics.

---

## Main features

- **Pairwise JavaScript comparison** between two source files.
- **Multi-representation analysis** using token-based, AST-based, IR/TAC-based, and CFG-based features.
- **20-feature similarity vector** used as input for classifiers.
- **Three supervised classifiers**:
  - Random Forest (`RF`)
  - XGBoost (`XGB`)
  - Multilayer Perceptron Neural Network (`NN`)
- **Relative originality report** for the compared pair.
- **Prediction confidence** based on classifier class probabilities.
- **Human-review framing** to avoid treating similarity as automatic plagiarism proof.

---

## Repository structure

```text
Tacco-JS/
├── Tokenizer/
│   ├── Tokenizer-Parser.js        # JavaScript tokenizer/parser utilities
│   ├── Tokenizer-Tokenizr.js      # Tokenizr-based tokenizer
│   └── ir.js                      # IR/TAC and CFG feature extraction
│
├── Vectorization/
│   ├── similarity.js              # Pairwise similarity feature computation
│   └── compare.js                 # CLI wrapper around similarity.js
│
├── LLMs/
│   ├── RandomForest.py            # Random Forest training/evaluation
│   ├── XGBoost.py                 # XGBoost training/evaluation
│   ├── NeuralNetwork.py           # MLP training/evaluation
│   ├── analyze_features.py        # Feature analysis utilities
│   └── Models/
│       ├── random_forest_model.joblib
│       ├── xgboost_model.joblib
│       └── neural_network_model.joblib
│
├── dataset/
│   ├── dataset solutions/
│   │   ├── js_files/              # Base JavaScript files
│   │   └── clones/                # Generated clone files
│   ├── generateCloneGoogleCloud.ipynb
│   └── validate_clones.ipynb
│
├── Test/                          # Example JavaScript files
├── predict.py                     # Pairwise prediction and originality report CLI
├── codesCollector.py              # CodeNet JavaScript collection utility
├── package.json
└── LICENSE
```

---

## Requirements

### System requirements

- Node.js 18+
- Python 3.10+
- npm

### Node.js dependencies

The JavaScript pipeline uses:

- `acorn`
- `acorn-walk`
- `moo`
- `tokenizr`

Install them with:

```bash
npm install
```

### Python dependencies

The prediction and training scripts require:

```bash
pip install numpy joblib scikit-learn xgboost matplotlib
```

> [!TIP]
> A recommended setup is to create a Python virtual environment first and then install both Python and Node.js dependencies.

A recommended setup is:

```bash
python -m venv .venv
source .venv/bin/activate
pip install numpy joblib scikit-learn xgboost matplotlib
npm install
```

On Windows PowerShell:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install numpy joblib scikit-learn xgboost matplotlib
npm install
```

---

## Quick start

> [!NOTE]
> If no model is specified, `predict.py` uses Random Forest (`RF`) by default.

Compare two JavaScript files using the default model, Random Forest:

```bash
python predict.py Test/froggie_jump.js Test/froggie_jump_403.js
```

Select a model with an alias:

```bash
python predict.py Test/froggie_jump.js Test/froggie_jump_403.js --model RF
python predict.py Test/froggie_jump.js Test/froggie_jump_403.js --model XGB
python predict.py Test/froggie_jump.js Test/froggie_jump_403.js --model NN
```

You can also pass a custom `.joblib` model path:

```bash
python predict.py Test/froggie_jump.js Test/froggie_jump_403.js --model LLMs/Models/xgboost_model.joblib
```

Show the final feature vector used by the model:

```bash
python predict.py Test/froggie_jump.js Test/froggie_jump_403.js --model XGB --show-vector
```

Print a JSON summary:

```bash
python predict.py Test/froggie_jump.js Test/froggie_jump_403.js --model XGB --json
```

---

## Model aliases

| Alias | Model path |
|---|---|
| `RF` | `LLMs/Models/random_forest_model.joblib` |
| `XGB` | `LLMs/Models/xgboost_model.joblib` |
| `NN` | `LLMs/Models/neural_network_model.joblib` |

---

## Example output

```text
========================================================================
Tacco JS - Similarity Prediction Report
========================================================================
File A          : /path/to/fileA.js
File B          : /path/to/fileB.js
Model selected  : XGB
Model path      : /path/to/LLMs/Models/xgboost_model.joblib
Compare mode    : 3 (type-value)
Features raw    : 20
Model features  : 20

Class probabilities:
  Type-I Clone       prob=0.0024%
  Type-II Clone      prob=0.0043%
  Type-III Clone     prob=3.1498%
  Type-IV Clone      prob=96.8435%

Prediction confidence: 96.8435%
Note: this confidence is not a probability of plagiarism; it only indicates the classifier confidence for the clone type.

Final result:
  Prediction           : Type-IV Clone
  Relative originality : Ambiguous originality: semantic-clone evidence detected
  Evidence level       : semantic similarity / review required
  Recommended action   : Review manually. Similar behavior may come from copying, a canonical algorithm, or independent convergence.
  Note                 : this result compares A against B; it does not prove absolute originality or plagiarism.
========================================================================
```

---

## Compare mode

`predict.py` forwards the comparison mode to `Vectorization/similarity.js`.

| Mode | Meaning |
|---|---|
| `1` | token type comparison |
| `2` | token value comparison |
| `3` | token type-value comparison |

Default:

```bash
--compare-mode 3
```

Example:

```bash
python predict.py fileA.js fileB.js --model RF --compare-mode 3
```

---

## Direct similarity vector usage

To call the JavaScript vectorizer directly:

```bash
node Vectorization/compare.js fileA.js fileB.js 3
```

This prints the similarity vector as JSON.

---

## Similarity feature vector

The final experimental vector contains 20 features:

| Group | Features |
|---|---|
| Token-based metrics | Jaccard, Dice, Levenshtein Ratio, Cosine Similarity, LCS Ratio, N-Gram Jaccard, N-Gram Dice, Length Ratio, Vocabulary Ratio |
| IR/TAC metrics | IR Instruction Count Ratio, IR Branch Count Ratio, IR Call Count Ratio, IR Function Count Ratio, IR Branch Density Difference |
| Normalized AST metrics | NormAST Jaccard, NormAST LCS Ratio, NormAST Cosine |
| CFG metrics | CFG Node Count Ratio, CFG Edge Count Ratio, CFG Cyclomatic Ratio |

These features are designed to capture lexical overlap, sequence preservation, syntactic structure, intermediate operations, and control-flow complexity.

---

## Training models

The repository includes training scripts for each classifier.

### Random Forest

```bash
python LLMs/RandomForest.py --use-cache
```

Rebuild and save cache:

```bash
python LLMs/RandomForest.py --rebuild-cache --save-cache
```

### XGBoost

```bash
python LLMs/XGBoost.py --use-cache
```

Rebuild and save cache:

```bash
python LLMs/XGBoost.py --rebuild-cache --save-cache
```

### Neural Network

```bash
python LLMs/NeuralNetwork.py --use-cache
```

Rebuild and save cache:

```bash
python LLMs/NeuralNetwork.py --rebuild-cache --save-cache
```

Training scripts expect the dataset to follow this structure:

```text
dataset/dataset solutions/
├── js_files/
│   ├── 1.js
│   ├── 2.js
│   └── ...
└── clones/
    ├── 1_clon_1.js
    ├── 1_clon_2.js
    ├── 1_clon_3.js
    ├── 1_clon_4.js
    └── ...
```

---

## Dataset

The base JavaScript files were collected from IBM Project CodeNet. Clone variants were generated for Type-I, Type-II, Type-III, and Type-IV clone categories.

> [!WARNING]
> The current dataset should be interpreted as an **experimental clone-type classification dataset**, not as a production benchmark for plagiarism detection. The current scope focuses on distinguishing clone types among generated clone pairs. Real non-clone accepted submissions should be added in future work to model normal independent similarity between correct solutions.

---

## Reported experimental results

> [!NOTE]
> The reported metrics come from controlled experiments on generated clone pairs. They should not be read as production-level plagiarism-detection guarantees.

The current report evaluates Random Forest, XGBoost, and MLP Neural Network using the same 20-feature representation.

| Model | Unseen accuracy | Macro F1 |
|---|---:|---:|
| Random Forest | 0.9304 | 0.93 |
| MLP Neural Network | 0.9281 | 0.93 |
| XGBoost | 0.9344 | 0.93 |

Main findings:

- Type-I clones are detected with near-perfect performance.
- Type-II clones reach high reliability, around F1 = 0.98.
- Type-III and Type-IV clones are harder, with F1 scores around 0.86-0.88.
- Most errors occur between Type-III and Type-IV clones.
- XGBoost achieves the highest unseen accuracy, while Random Forest remains highly interpretable through feature importance.

---

## Interpreting results responsibly

> [!CAUTION]
> Tacco JS should be used as a similarity-analysis tool, not as a final judge.

The report should be interpreted as:

- evidence of similarity between two compared files;
- a predicted clone-type relationship;
- a relative originality signal with respect to the compared file;
- a reason to review the pair manually when similarity is high.

It should **not** be interpreted as:

- proof of plagiarism;
- proof of dishonesty;
- proof that a candidate lacks programming ability;
- absolute proof that a solution is original or non-original.

---

## Limitations

> [!WARNING]
> The current system estimates relative implementation similarity between two files. It does not prove absolute originality and does not yet include a robust real-world No-Clone class.

- The current classifier separates Type-I to Type-IV clone categories, but does not yet include a robust real-world No-Clone class.
- Type-IV clone detection remains difficult because semantic equivalence cannot be fully determined with static features alone.
- The dataset uses generated clone transformations, so results should be understood as controlled experimental evidence.
- Real competitive programming or interview settings require comparison against many accepted submissions for the same problem.
- Additional execution-based features, semantic embeddings, or validated organic submissions are recommended for future versions.

---

## Development notes

The project combines JavaScript and Python components:

- JavaScript handles tokenization, parsing, IR/TAC extraction, CFG construction, and similarity vector generation.
- Python handles model training, evaluation, model storage, and prediction reports.

Useful commands:

```bash
# Install JS dependencies
npm install

# Compare two files with the JS vectorizer
node Vectorization/compare.js Test/froggie_jump.js Test/froggie_jump_403.js 3

# Run prediction report
python predict.py Test/froggie_jump.js Test/froggie_jump_403.js --model XGB

# Show vector used by model
python predict.py Test/froggie_jump.js Test/froggie_jump_403.js --model XGB --show-vector

# Output JSON summary
python predict.py Test/froggie_jump.js Test/froggie_jump_403.js --model XGB --json
```

---

## Authors

Developed by:

- Rodrigo López Guerra
- Abigail Pérez García
- Alvaro Alberto Cruz Jiménez
- Fernando Maggi Llerandi

Tecnológico de Monterrey — School of Engineering and Sciences.

---

## License

This project is licensed under the MIT License. See [`LICENSE`](LICENSE) for details.
