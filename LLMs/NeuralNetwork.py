import json
import random
import subprocess
import joblib
import argparse
import numpy as np
from pathlib import Path
from sklearn.neural_network import MLPClassifier
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

# MLP architecture — hidden layers tuple, e.g. (64,) or (128, 64)
MLP_HIDDEN_LAYERS  = (128, 64)
MLP_ACTIVATION     = "relu"      # 'relu' | 'tanh' | 'logistic'
MLP_SOLVER         = "adam"      # 'adam' | 'sgd' | 'lbfgs'
MLP_ALPHA          = 1e-4        # L2 regularization on weights
MLP_LEARNING_RATE  = 1e-3        # Initial learning rate (adam/sgd)
MLP_MAX_ITER       = 500
MLP_EARLY_STOPPING = True        # Hold out 10% of train for early stopping
MLP_BATCH_SIZE     = "auto"

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
    n_feats = X.shape[1]

    print("\n" + "=" * 65)
    print(f"  TRAINING POOL SUMMARY  ({int(TRAIN_FILE_RATIO*100)}% of base files)")
    print("=" * 65)
    print(f"  Total pairs      : {len(y)}")
    for c, name in enumerate(CLASS_NAMES):
        print(f"    {name:<14}: {int((y == c).sum())}")
    print(f"  Features ({n_feats})   : {METRIC_NAMES}")
    print(f"  Labels           : filename ground truth (no threshold bias)")
    print(f"\n  MLP architecture  : {MLP_HIDDEN_LAYERS}")
    print(f"  Activation        : {MLP_ACTIVATION}")
    print(f"  Solver            : {MLP_SOLVER}  lr={MLP_LEARNING_RATE}")
    print(f"  L2 alpha          : {MLP_ALPHA}   early_stopping={MLP_EARLY_STOPPING}")
    if len(set(y)) < 2:
        print("\n[WARNING] Only one class present — cannot train.")
        return
 
    # ── Split ──────────────────────────────────────────────────
    indices = list(range(len(y)))
    X_train, X_test, y_train, y_test, idx_train, idx_test = train_test_split(
        X, y, indices,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
    )
 
    # ── Scale (mandatory for MLP) ───────────────────────────────
    scaler     = StandardScaler()
    X_train_sc = scaler.fit_transform(X_train)
    X_test_sc  = scaler.transform(X_test)
 
    # ── MLP ────────────────────────────────────────────────────
    clf = MLPClassifier(
        hidden_layer_sizes  = MLP_HIDDEN_LAYERS,
        activation          = MLP_ACTIVATION,
        solver              = MLP_SOLVER,
        alpha               = MLP_ALPHA,
        learning_rate_init  = MLP_LEARNING_RATE,
        max_iter            = MLP_MAX_ITER,
        early_stopping      = MLP_EARLY_STOPPING,
        validation_fraction = 0.1,
        batch_size          = MLP_BATCH_SIZE,
        random_state        = RANDOM_STATE,
        verbose             = False,
    )
 
    print("\n" + "=" * 65)
    print(f"  TRAINING  (MLP {MLP_HIDDEN_LAYERS} — {n_feats} features, 4 classes)")
    print("=" * 65)
    clf.fit(X_train_sc, y_train)
    print(f"  Training completed.  Epochs run: {clf.n_iter_}")

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
        model_dir / "neural_network_model.joblib"
    )

    print(f"  Modelo guardado en: {model_dir / 'neural_network_model.joblib'}")

    if MLP_EARLY_STOPPING:
        print(f"  Best validation score: {clf.best_validation_score_:.4f}")
 
    # ── Evaluation ─────────────────────────────────────────────
    y_pred = clf.predict(X_test_sc)
    y_prob = clf.predict_proba(X_test_sc)
 
    print("\n" + "=" * 65)
    print("  EVALUATION  (internal test set — 4 classes)")
    print("=" * 65)
    print(f"  Accuracy : {accuracy_score(y_test, y_pred):.4f}\n")
    print(classification_report(y_test, y_pred, target_names=CLASS_NAMES))
 
    cm = confusion_matrix(y_test, y_pred, labels=[0, 1, 2, 3])
    print("  Confusion Matrix (rows=truth, cols=predicted):")
    _print_confusion(cm)
 
    print("\n  Accuracy by clone type (test pairs):")
    for ctype in CLONE_TYPES:
        ct_idx = [i for i, idx in enumerate(idx_test) if pair_meta[idx][2] == ctype]
        if not ct_idx:
            print(f"    Type {ctype}: no test pairs")
            continue
        acc = accuracy_score(y_test[ct_idx], y_pred[ct_idx])
        print(f"    Type {ctype}: {len(ct_idx)} pairs  accuracy={acc:.4f}")
 
    # ── Layer weight summary ───────────────────────────────────
    print("\n  Network layer shapes:")
    for i, (W, b) in enumerate(zip(clf.coefs_, clf.intercepts_)):
        print(f"    Layer {i+1}: weights {W.shape}  biases {b.shape}")
 
    # ── Loss curve ─────────────────────────────────────────────
    curve = clf.loss_curve_
    print(f"\n  Loss curve — first/last 3 iterations:")
    head = list(range(min(3, len(curve))))
    tail = list(range(max(3, len(curve) - 3), len(curve)))
    for i in head:
        print(f"    iter {i+1:>4}: loss={curve[i]:.6f}")
    if len(curve) > 6:
        print("    ...")
    for i in tail:
        print(f"    iter {i+1:>4}: loss={curve[i]:.6f}")
 
    # ── Most confident predictions (top 3 per class) ───────────
    print("\n  Most confident predictions (top 3 per class):")
    for c, cname in enumerate(CLASS_NAMES):
        prob_col = y_prob[:, c]
        top_idx  = np.argsort(prob_col)[::-1][:3]
        print(f"  {cname}:")
        for rank, i in enumerate(top_idx, 1):
            idx    = idx_test[i]
            base, clone, ctype, kind = pair_meta[idx]
            verdict = CLASS_NAMES[y_pred[i]]
            print(f"    #{rank}  {base} vs {clone}  "
                  f"P={prob_col[i]:.4f}  → {verdict}")
 
    # ── Per-pair test detail ───────────────────────────────────
    print("\n" + "=" * 65)
    print("  PER-PAIR RESULTS  (internal test set)")
    print("=" * 65)
    _print_header(with_truth=True)
    for i, idx in enumerate(idx_test):
        base, clone, ctype, kind = pair_meta[idx]
        print(_verdict_line(base, clone, ctype, kind,
                            X[idx], y_pred[i], truth=y_test[i]))
 
    # ── Full training pool table ───────────────────────────────
    print("\n" + "=" * 65)
    print("  FULL PREDICTION TABLE  (training pool)")
    print("=" * 65)
    all_pred = clf.predict(scaler.transform(X))
    _print_header(with_truth=False)
    for i, (base, clone, ctype, kind) in enumerate(pair_meta):
        print(_verdict_line(base, clone, ctype, kind, X[i], all_pred[i]))
 
    # ── Unseen pool predictions ────────────────────────────────
    if len(X_unseen) > 0:
        print("\n" + "=" * 65)
        print(f"  UNSEEN FILES PREDICTIONS  "
              f"(remaining {int((1-TRAIN_FILE_RATIO)*100)}%)")
        print("=" * 65)
 
        unseen_pred = clf.predict(scaler.transform(X_unseen))
 
        if len(set(y_unseen)) >= 2:
            print(f"  Accuracy on unseen : "
                  f"{accuracy_score(y_unseen, unseen_pred):.4f}\n")
            print(classification_report(y_unseen, unseen_pred,
                                        target_names=CLASS_NAMES))
        else:
            print("  (Only one class in unseen labels — skipping metrics)\n")
 
        _print_header(with_truth=True)
        for i, (base, clone, ctype, kind) in enumerate(meta_unseen):
            print(_verdict_line(base, clone, ctype, kind, X_unseen[i],
                                unseen_pred[i], truth=y_unseen[i]))
 
    # ── Final accuracy summary ─────────────────────────────────
    print("\n" + "=" * 65)
    print("  FINAL ACCURACY SUMMARY  (MLP)")
    print("=" * 65)
    acc_train = accuracy_score(y_train, clf.predict(X_train_sc))
    acc_test  = accuracy_score(y_test,  y_pred)
    if len(X_unseen) > 0:
        acc_unseen = accuracy_score(
            y_unseen, clf.predict(scaler.transform(X_unseen))
        )
        print(f"  train={acc_train:.4f}  test={acc_test:.4f}  "
              f"unseen={acc_unseen:.4f}")
    else:
        print(f"  train={acc_train:.4f}  test={acc_test:.4f}")


# ─────────────────────────────────────────────
#  Entry Point
# ─────────────────────────────────────────────

def main():
    global PLAGIARISM_THRESHOLD, MLP_HIDDEN_LAYERS, MLP_ACTIVATION
    global MLP_SOLVER, MLP_ALPHA, MLP_LEARNING_RATE, MLP_MAX_ITER, MLP_EARLY_STOPPING

    parser = argparse.ArgumentParser(
        description="Plagiarism detector — MLP Neural Network."
    )
    parser.add_argument("--hidden-layers", type=str, default="128,64",
                        help="Hidden layer sizes, e.g. '128,64' (default: 128,64).")
    parser.add_argument("--activation", type=str, default=MLP_ACTIVATION,
                        choices=["relu", "tanh", "logistic"])
    parser.add_argument("--alpha",    type=float, default=MLP_ALPHA)
    parser.add_argument("--lr",       type=float, default=MLP_LEARNING_RATE)
    parser.add_argument("--max-iter", type=int,   default=MLP_MAX_ITER)
    parser.add_argument("--no-early-stopping", action="store_true")
    args = parser.parse_args()
 
    MLP_HIDDEN_LAYERS  = tuple(int(x) for x in args.hidden_layers.split(","))
    MLP_ACTIVATION     = args.activation
    MLP_ALPHA          = args.alpha
    MLP_LEARNING_RATE  = args.lr
    MLP_MAX_ITER       = args.max_iter
    MLP_EARLY_STOPPING = not args.no_early_stopping
 
    if not COMPARE_JS.exists():
        print(f"\n[ERROR] compare.js not found: {COMPARE_JS}")
        return
 
    print("\n" + "=" * 65)
    print("  DISCOVERING FILES")
    print("=" * 65)
 
    print(f"\n  Base files  ->  {BASE_DIR}")
    base_files = discover_js_files(BASE_DIR, "BASE")
 
    print(f"\n  Clone files ->  {CLONES_DIR}")
    clone_files = discover_js_files(CLONES_DIR, "CLONE")
 
    if not base_files:
        print("\n[ERROR] No base .js files found.")
        return
    if not clone_files:
        print("\n[ERROR] No clone .js files found.")
        return
 
    # ── File-level train / unseen split ───────────────────────
    all_base_stems = sorted(base_files.keys())
    random.seed(RANDOM_STATE)
    random.shuffle(all_base_stems)
 
    n_train      = max(1, round(len(all_base_stems) * TRAIN_FILE_RATIO))
    train_stems  = set(all_base_stems[:n_train])
    unseen_stems = set(all_base_stems[n_train:])
 
    train_base_files  = {s: base_files[s] for s in train_stems}
    unseen_base_files = {s: base_files[s] for s in unseen_stems}
 
    print("\n" + "=" * 65)
    print("  FILE SPLIT")
    print("=" * 65)
    print(f"  Total base files        : {len(all_base_stems)}")
    print(f"  Training pool ({int(TRAIN_FILE_RATIO*100):>2}%)  : "
          f"{len(train_stems)} files  {sorted(train_stems)}")
    print(f"  Unseen pool   ({int((1-TRAIN_FILE_RATIO)*100):>2}%)  : "
          f"{len(unseen_stems)} files")
 
    print("\n" + "=" * 65)
    print(f"  BUILDING TRAINING DATASET  ({int(TRAIN_FILE_RATIO*100)}% of files)")
    print("=" * 65)
    X, y, pair_meta = build_dataset(train_base_files, clone_files)
 
    if len(X) == 0:
        print("\n[ERROR] No pairs built.")
        return
 
    print("\n" + "=" * 65)
    print(f"  BUILDING UNSEEN DATASET  "
          f"(remaining {int((1-TRAIN_FILE_RATIO)*100)}% of files)")
    print("=" * 65)
    X_unseen, y_unseen, meta_unseen = build_dataset(unseen_base_files, clone_files)
 
    train_and_evaluate(X, y, pair_meta, X_unseen, y_unseen, meta_unseen)
    print("\n[DONE]\n")
 
 
if __name__ == "__main__":
    main()