# SPDX-FileCopyrightText: 2026 Rodrigo López Guerra
# SPDX-FileCopyrightText: 2026 Abigail Pérez García
# SPDX-FileCopyrightText: 2026 Fernando Maggi Llerandi
#
# SPDX-License-Identifier: Apache-2.0

import re
import json
import random
import subprocess
import argparse
import joblib
import numpy as np
from pathlib import Path
from sklearn.linear_model import SGDClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

# ─────────────────────────────────────────────
#  Paths
# ─────────────────────────────────────────────

COMPARE_JS = Path("Vectorization/compare.js")
BASE_DIR      = Path("dataset_copy/dataset general/js_files")
CLONES_DIR    = Path("dataset_copy/dataset general/clones")

CLONE_TYPES          = [1, 2, 3]
NGRAM_SIZES          = [1, 2, 3]
COMPARE_MODE         = 1  # 1=type, 2=value, 3=type-value
TRAIN_FILE_RATIO     = 0.10
TEST_SIZE            = 0.15
RANDOM_STATE         = 42

# Ratio of negative (non-clone) pairs to generate per base file
NEGATIVES_PER_BASE = 3

# SGD hyperparameters
SGD_LOSS          = "log_loss"  # 'log_loss' (Logistic) | 'hinge' (SVM) | 'modified_huber'
SGD_PENALTY       = "l2"        # 'l1' | 'l2' | 'elasticnet'
SGD_ALPHA         = 1e-4        # Regularization strength
SGD_MAX_ITER      = 1000
SGD_TOL           = 1e-3        # Convergence tolerance
SGD_LEARNING_RATE = "optimal"   # 'optimal' | 'adaptive' | 'constant' | 'invscaling'
SGD_ETA0          = 0.1         # Initial lr (used when learning_rate != 'optimal')
SGD_L1_RATIO      = 0.15        # ElasticNet mixing (only when penalty='elasticnet')

# ─────────────────────────────────────────────
#  JS Feature Extraction (16 features)
# ─────────────────────────────────────────────

METRIC_NAMES = [
    "Jaccard", "Dice", "LevenshteinRatio", "Jaro", "JaroWinkler",
    "Cosine", "Overlap", "LCSRatio", "NgramJaccard", "NgramDice",
    "GaussManhattan", "GaussEuclidean", "GaussMinkowski", "GaussChebyshev",
    "LengthRatio", "VocabularyRatio",
]

def compare_with_js(file_a: Path, file_b: Path) -> list:
    if not COMPARE_JS.exists():
        raise FileNotFoundError(f"compare.js not found: {COMPARE_JS}")
    try:
        result = subprocess.run(
            ["node", str(COMPARE_JS), str(file_a), str(file_b), str(COMPARE_MODE)],
            capture_output=True, text=True,
            encoding="utf-8", errors="ignore", timeout=30,
        )
    except FileNotFoundError:
        raise RuntimeError("Node.js is not installed or not on PATH.")
    except subprocess.TimeoutExpired:
        print(f"  [TIMEOUT] {file_a.name} vs {file_b.name} — skipping")
        return []
 
    if result.returncode != 0:
        print(f"  [JS ERROR] {file_a.name} vs {file_b.name}: "
              f"{result.stderr.strip()[:120]}")
        return []
 
    try:
        feats = json.loads(result.stdout.strip())
        if len(feats) != len(METRIC_NAMES):
            print(f"  [WARN] Expected {len(METRIC_NAMES)} features, "
                  f"got {len(feats)} for {file_a.name} vs {file_b.name}")
            return []
        return [float(f) for f in feats]
    except (json.JSONDecodeError, ValueError) as e:
        print(f"  [PARSE ERROR] {file_a.name} vs {file_b.name}: {e}")
        return []

# ─────────────────────────────────────────────
#  File Discovery
# ─────────────────────────────────────────────
 
def discover_js_files(folder: Path, label: str) -> dict:
    if not folder.exists():
        raise FileNotFoundError(f"Folder not found: {folder}")
 
    files = {}
    for fpath in sorted(folder.glob("*.js")):
        files[fpath.stem] = fpath
        print(f"  [FOUND {label}] {fpath.name}")
    return files

# ─────────────────────────────────────────────
#  Dataset Construction
# ─────────────────────────────────────────────
 
def build_dataset(base_files: dict, clone_files: dict) -> tuple:
    X, y, pair_meta = [], [], []
    all_clone_stems = list(clone_files.keys())
    matched = skipped = negatives = 0
 
    for base_stem, base_path in base_files.items():
 
        # ── Positive pairs: true clones, label = clone type ───
        for ctype in CLONE_TYPES:
            clone_stem = f"{base_stem}_clon_{ctype}"
            if clone_stem not in clone_files:
                print(f"  [MISSING] {clone_stem}.js")
                skipped += 1
                continue
 
            feats = compare_with_js(base_path, clone_files[clone_stem])
            if not feats:
                skipped += 1
                continue
 
            X.append(feats)
            y.append(ctype)                          # ground truth: 1, 2, or 3
            pair_meta.append((base_stem, clone_stem, ctype, "positive"))
            matched += 1
 
        # ── Negative pairs: unrelated clones, label = 0 ───────
        unrelated = [
            s for s in all_clone_stems
            if not s.startswith(f"{base_stem}_clon_")
        ]
        random.seed(RANDOM_STATE + hash(base_stem) % 10000)
        sampled = random.sample(unrelated, min(NEGATIVES_PER_BASE, len(unrelated)))
        for neg_stem in sampled:
            feats = compare_with_js(base_path, clone_files[neg_stem])
            if not feats:
                continue
            X.append(feats)
            y.append(0)                              # ground truth: not a clone
            pair_meta.append((base_stem, neg_stem, 0, "negative"))
            negatives += 1
 
    print(f"\n  Positive pairs (true clones) : {matched}")
    print(f"  Negative pairs (non-clones)  : {negatives}")
    print(f"  Skipped (errors/missing)     : {skipped}")
    return np.array(X, dtype=float), np.array(y, dtype=int), pair_meta

# ─────────────────────────────────────────────
#  Output Helpers
# ─────────────────────────────────────────────

CLASS_NAMES = ["Clean (0)", "Type 1 (1)", "Type 2 (2)", "Type 3 (3)"] 

def _verdict_line(base, clone, ctype, kind, feats, pred, truth=None) -> str:
    # Show 4 representative metrics from the 16
    j   = feats[METRIC_NAMES.index("Jaccard")]
    d   = feats[METRIC_NAMES.index("Dice")]
    co  = feats[METRIC_NAMES.index("Cosine")]
    lv  = feats[METRIC_NAMES.index("LevenshteinRatio")]
 
    verdict  = "clean" if pred == 0 else f"PLAGIARIZED/T{pred}"
    pair_tag = f"[T{ctype}]" if ctype > 0 else "[neg]"
 
    row = (f"  {base:<22} {clone:<30} {pair_tag:<7} "
           f"J:{j:.3f} D:{d:.3f} Cos:{co:.3f} Lev:{lv:.3f}  "
           f"{verdict:<16}")
 
    if truth is not None:
        true_v = "clean" if truth == 0 else f"PLAGIARIZED/T{truth}"
        flag   = "OK" if pred == truth else "WRONG"
        row   += f"  truth:{true_v:<16} {flag}"
 
    return row
 
 
def _print_header(with_truth=False):
    h = (f"  {'Base':<22} {'Clone':<30} {'Type':<7} "
         f"{'Jaccard':>9} {'Dice':>7} {'Cosine':>8} {'Levenshtn':>10}  "
         f"{'Verdict':<16}")
    if with_truth:
        h += "  Truth"
    print(h)
    print("  " + "-" * (len(h) + 4))
 
 
def _print_confusion(cm):
    labels = ["Clean", "Type1", "Type2", "Type3"]
    print(f"  {'':>14} " + " ".join(f"{l:>8}" for l in labels))
    for i, name in enumerate(labels):
        print(f"  {name:<14} " + " ".join(f"{cm[i, j]:>8}" for j in range(4)))
 
 
def _per_type_accuracy(y_true, y_pred, idx_test, pair_meta):
    for ctype in [0, 1, 2, 3]:
        ct_idx = [i for i, idx in enumerate(idx_test)
                  if pair_meta[idx][2] == ctype]
        if not ct_idx:
            continue
        acc = accuracy_score(y_true[ct_idx], y_pred[ct_idx])
        print(f"    {CLASS_NAMES[ctype]}: {len(ct_idx)} pairs  accuracy={acc:.4f}")

# ─────────────────────────────────────────────
#  Training & Evaluation
# ─────────────────────────────────────────────

def train_and_evaluate(
    X: np.ndarray, y: np.ndarray, pair_meta: list,
    X_unseen: np.ndarray, y_unseen: np.ndarray, meta_unseen: list,
):
    n_feats = len(METRIC_NAMES)

    print("\n" + "=" * 65)
    print(f"  TRAINING POOL SUMMARY  ({int(TRAIN_FILE_RATIO*100)}% of base files)")
    print("=" * 65)
    print(f"  Total pairs      : {len(y)}")
    print(f"  Plagiarized (1)  : {int(y.sum())}")
    print(f"  Clean (0)        : {int((y == 0).sum())}")
    print(f"  Features ({n_feats})    : {METRIC_NAMES} × n-grams {NGRAM_SIZES}")
    print(f"\n  SGD config:")
    print(f"    loss          : {SGD_LOSS}")
    print(f"    penalty       : {SGD_PENALTY}  alpha={SGD_ALPHA}")
    print(f"    learning_rate : {SGD_LEARNING_RATE}  eta0={SGD_ETA0}")
    if SGD_PENALTY == "elasticnet":
        print(f"    l1_ratio      : {SGD_L1_RATIO}")

    print("\n  Pairs by clone type:")
    for ctype in CLONE_TYPES:
        idx = [i for i, (_, _, t, _) in enumerate(pair_meta) if t == ctype]
        print(f"    Type {ctype}: {len(idx)} pairs")
        
    if len(set(y)) < 2:
        print("\n[WARNING] Only one class in labels — adjust --threshold.")
        _print_all_pairs(X, y, pair_meta)
        return

    # ── Split ──────────────────────────────────────────────────────────────
    indices = list(range(len(y)))
    X_train, X_test, y_train, y_test, idx_train, idx_test = train_test_split(
        X, y, indices,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        stratify=y,
    )

    # ── Scale — mandatory for SGD ───────────────────────────────────────────
    scaler = StandardScaler()
    X_train_sc = scaler.fit_transform(X_train)
    X_test_sc  = scaler.transform(X_test)

    # ── SGDClassifier ──────────────────────────────────────────────────────
    clf = SGDClassifier(
        loss          = SGD_LOSS,
        penalty       = SGD_PENALTY,
        alpha         = SGD_ALPHA,
        l1_ratio      = SGD_L1_RATIO,
        max_iter      = SGD_MAX_ITER,
        tol           = SGD_TOL,
        learning_rate = SGD_LEARNING_RATE,
        eta0          = SGD_ETA0,
        shuffle       = True,
        n_jobs        = -1,
        random_state  = RANDOM_STATE,
    )

    print("\n" + "=" * 65)
    print(f"  TRAINING  (SGDClassifier loss={SGD_LOSS} — 12 features)")
    print("=" * 65)

    clf.fit(X_train_sc, y_train)

    print(f"  Training completed.  Iterations: {clf.n_iter_}")

    SCRIPT_DIR = Path(__file__).resolve().parent
    model_dir = SCRIPT_DIR / "Models"
    model_dir.mkdir(parents=True, exist_ok=True)

    joblib.dump(
        {
            "model": clf,
            "scaler": scaler,
            "metric_names": METRIC_NAMES,
            "class_names": CLASS_NAMES,
        },
        model_dir / "sgd_classifier_model.joblib"
    )

    print(f"  Modelo guardado en: {model_dir / 'sgd_classifier_model.joblib'}")

    # ── Eval metrics ───────────────────────────────────────────────────────
    y_pred = clf.predict(X_test_sc)

    # predict_proba only available for log_loss and modified_huber
    has_proba = SGD_LOSS in ("log_loss", "modified_huber")
    if has_proba:
        y_prob = clf.predict_proba(X_test_sc)

    print("\n" + "=" * 65)
    print("  EVALUATION  (internal test set)")
    print("=" * 65)
    print(f"  Accuracy : {accuracy_score(y_test, y_pred):.4f}\n")
    print(classification_report(y_test, y_pred, target_names=CLASS_NAMES))

    cm = confusion_matrix(y_test, y_pred, labels=[0,1,2,3])

    print("\n  Confusion Matrix:")
    _print_confusion(cm)

    print("\n  Accuracy by class (test pairs):")
    _per_type_accuracy(y_test, y_pred, idx_test, pair_meta)
    
    # Learned coefficients
    if hasattr(clf, "coef_"):
        coefs = clf.coef_.flatten()
        feat_labels = METRIC_NAMES
        sorted_idx  = np.argsort(np.abs(coefs))[::-1]
        print("\n  SGD feature weights (sorted by |weight|):")
        for i in sorted_idx[:8]:
            label = feat_labels[i] if i < len(feat_labels) else f"f{i}"
            print(f"    {label:<8}  {coefs[i]:+.4f}")

    # ── Online Learning demo with partial_fit ──────────────────────────────
    print("\n" + "=" * 65)
    print("  ONLINE LEARNING DEMO  (partial_fit over training chunks)")
    print("=" * 65)

    chunk_size  = max(1, len(X_train_sc) // 5)
    sgd_online  = SGDClassifier(
        loss=SGD_LOSS, penalty=SGD_PENALTY, alpha=SGD_ALPHA,
        max_iter=1, tol=None, shuffle=True, random_state=RANDOM_STATE,
    )
    print(f"  Chunk size: {chunk_size} pairs")
    for start in range(0, len(X_train_sc), chunk_size):
        end = start + chunk_size
        sgd_online.partial_fit(
            X_train_sc[start:end], y_train[start:end],
            classes=[0, 1, 2, 3],
        )
        acc_chunk = accuracy_score(y_test, sgd_online.predict(X_test_sc))
        print(f"    After chunk [{start:>3}–{min(end, len(X_train_sc)):>3}] "
              f"({min(end, len(X_train_sc)) - start} pairs)  "
              f"test accuracy = {acc_chunk:.4f}")

    # ── Per-pair test results ───────────────────────────────────────────────
    print("\n" + "=" * 65)
    print("  PER-PAIR RESULTS  (internal test set)")
    print("=" * 65)
    _print_header(with_truth=True)
    for i, idx in enumerate(idx_test):
        base, clone, ctype, kind = pair_meta[idx]
        print(_verdict_line(base, clone, ctype, kind, X[idx], y_pred[i], truth=y_test[i]))

    # ── Full training pool table ────────────────────────────────────────────
    print("\n" + "=" * 65)
    print("  FULL PREDICTION TABLE  (training pool)")
    print("=" * 65)
    all_pred = clf.predict(scaler.transform(X))
    _print_header(with_truth=False)
    for i, (base, clone, ctype, kind) in enumerate(pair_meta):
        print(_verdict_line(base, clone, ctype, kind,X[i], all_pred[i]))

    # ── Unseen pool predictions ─────────────────────────────────────────────
    if len(X_unseen) > 0:
        print("\n" + "=" * 65)
        print(f"  UNSEEN FILES PREDICTIONS  (remaining {int((1-TRAIN_FILE_RATIO)*100)}%)")
        print("=" * 65)

        unseen_pred = clf.predict(scaler.transform(X_unseen))

        if len(set(y_unseen)) >= 2:
            print(f"  Accuracy on unseen : {accuracy_score(y_unseen, unseen_pred):.4f}\n")
            print(classification_report(y_unseen, unseen_pred,target_names=CLASS_NAMES))
        else:
            print("  (Only one class in unseen labels — skipping metrics)\n")

        _print_header(with_truth=True)
        for i, (base, clone, ctype, kind) in enumerate(meta_unseen):
            print(_verdict_line(base, clone, ctype, kind, X_unseen[i],
                                unseen_pred[i], truth=y_unseen[i]))


def _print_all_pairs(X, y, pair_meta):
    """Fallback when only one label class exists."""
    _print_header(with_truth=True)
    for i, (base, clone, ctype, kind) in enumerate(pair_meta):
        print(_verdict_line(base, clone, ctype, X[i], int(y[i]), truth=int(y[i])))


# ─────────────────────────────────────────────
#  Entry Point
# ─────────────────────────────────────────────

def main():
    global PLAGIARISM_THRESHOLD, SGD_LOSS, SGD_PENALTY, SGD_ALPHA
    global SGD_MAX_ITER, SGD_LEARNING_RATE, SGD_ETA0, SGD_L1_RATIO

    parser = argparse.ArgumentParser(
        description="Plagiarism detector — SGDClassifier (online linear model)."
    )
    parser.add_argument(
        "--loss", type=str, default=SGD_LOSS,
        choices=["log_loss", "hinge", "modified_huber", "perceptron"],
        help=f"Loss function / model type (default: {SGD_LOSS})."
    )
    parser.add_argument(
        "--penalty", type=str, default=SGD_PENALTY,
        choices=["l1", "l2", "elasticnet"],
        help=f"Regularization type (default: {SGD_PENALTY})."
    )
    parser.add_argument(
        "--alpha", type=float, default=SGD_ALPHA,
        help=f"Regularization strength (default: {SGD_ALPHA})."
    )
    parser.add_argument(
        "--lr", type=str, default=SGD_LEARNING_RATE,
        choices=["optimal", "adaptive", "constant", "invscaling"],
        help=f"Learning rate schedule (default: {SGD_LEARNING_RATE})."
    )
    parser.add_argument(
        "--eta0", type=float, default=SGD_ETA0,
        help=f"Initial learning rate for non-optimal schedules (default: {SGD_ETA0})."
    )
    parser.add_argument(
        "--l1-ratio", type=float, default=SGD_L1_RATIO,
        help=f"ElasticNet L1 ratio (default: {SGD_L1_RATIO})."
    )
    args = parser.parse_args()

    SGD_LOSS             = args.loss
    SGD_PENALTY          = args.penalty
    SGD_ALPHA            = args.alpha
    SGD_LEARNING_RATE    = args.lr
    SGD_ETA0             = args.eta0
    SGD_L1_RATIO         = args.l1_ratio

    if not COMPARE_JS.exists():
        print(f"\n[ERROR] compare.js not found: {COMPARE_JS}")
        return

    print("\n" + "=" * 65)
    print("  LOADING FILES  (via JS tokenizer)")
    print("=" * 65)

    base_files = discover_js_files(BASE_DIR, "BASE")
    print(f"\n  Base files  ->  {BASE_DIR}")

    clone_files = discover_js_files(CLONES_DIR, "CLONE")
    print(f"\n  Clone files ->  {CLONES_DIR}")

    if not base_files:
        print("\n[ERROR] No base .js files loaded.")
        return
    if not clone_files:
        print("\n[ERROR] No clone .js files loaded.")
        return

    import random
    all_base_stems = sorted(base_files.keys())
    random.seed(RANDOM_STATE)
    random.shuffle(all_base_stems)

    n_train_files = max(1, round(len(all_base_stems) * TRAIN_FILE_RATIO))
    train_stems   = set(all_base_stems[:n_train_files])
    unseen_stems  = set(all_base_stems[n_train_files:])

    train_base_files  = {s: base_files[s] for s in train_stems}
    unseen_base_files = {s: base_files[s] for s in unseen_stems}

    print("\n" + "=" * 65)
    print("  FILE SPLIT")
    print("=" * 65)
    print(f"  Total base files        : {len(all_base_stems)}")
    print(f"  Training pool ({int(TRAIN_FILE_RATIO*100):>2}%)  : {len(train_stems)} files  {sorted(train_stems)}")
    print(f"  Unseen pool   ({int((1-TRAIN_FILE_RATIO)*100):>2}%)  : {len(unseen_stems)} files")

    print("\n" + "=" * 65)
    print(f"  BUILDING TRAINING DATASET  ({int(TRAIN_FILE_RATIO*100)}% of files)")
    print("=" * 65)
    X, y, pair_meta = build_dataset(train_base_files, clone_files)

    if len(X) == 0:
        print("\n[ERROR] No pairs built. Check clone filenames: <base>_clon_<1|2|3>.js")
        return

    print("\n" + "=" * 65)
    print(f"  BUILDING UNSEEN DATASET  (remaining {int((1-TRAIN_FILE_RATIO)*100)}% of files)")
    print("=" * 65)
    X_unseen, y_unseen, meta_unseen = build_dataset(unseen_base_files, clone_files)

    train_and_evaluate(X, y, pair_meta, X_unseen, y_unseen, meta_unseen)
    print("\n[DONE]\n")


if __name__ == "__main__":
    main()