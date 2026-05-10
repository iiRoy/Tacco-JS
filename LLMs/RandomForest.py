import re
import json
import random
import subprocess
import argparse
import numpy as np
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

# ─────────────────────────────────────────────
#  Paths
# ─────────────────────────────────────────────

COMPARE_JS = Path("Vectorization/compare.js")
BASE_DIR      = Path("dataset/dataset general/js_files")
CLONES_DIR    = Path("dataset/dataset general/clones")

CLONE_TYPES          = [1, 2, 3]
NGRAM_SIZES          = [1, 2, 3]
COMPARE_MODE         = 1  # 1=type, 2=value, 3=type-value
TRAIN_FILE_RATIO     = 0.10
TEST_SIZE            = 0.15
RANDOM_STATE         = 42

# Ratio of negative (non-clone) pairs to generate per base file
NEGATIVES_PER_BASE = 3

# Random Forest hyperparameters
RF_N_ESTIMATORS      = 100     # Number of trees in the forest
RF_CRITERION         = "gini"  # 'gini' | 'entropy' | 'log_loss'
RF_MAX_DEPTH         = None    # None = grow until pure leaves; int to cap depth
RF_MIN_SAMPLES_SPLIT = 2       # Min samples to split an internal node
RF_MIN_SAMPLES_LEAF  = 1       # Min samples at a leaf node
RF_MAX_FEATURES      = "sqrt"  # Features per split: 'sqrt' | 'log2' | int | float | None
RF_BOOTSTRAP         = True    # Whether to use bootstrap samples (bagging)
RF_CLASS_WEIGHT      = None    # None | 'balanced' | 'balanced_subsample'
RF_OOB_SCORE         = True    # Estimate generalisation using out-of-bag samples (requires bootstrap=True)

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
    """
    Return {stem: Path} for every .js file found in folder.
    No tokenization needed — compare.js receives raw file paths.
    """
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
    """
    Builds a 4-class dataset by calling compare.js for each pair.
 
    Labels come from filename ground truth only — no threshold bias:
        Positive pairs  →  label = clone type (1, 2, or 3)
        Negative pairs  →  label = 0  (genuinely unrelated files)
 
    pair_meta entries are always 4-tuples:
        (base_stem, clone_stem, ctype, pair_kind)
    """
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
    """
    Print one result row showing the first 4 metric averages for readability,
    plus the full verdict and optional ground-truth comparison.
    """
    j  = feats[METRIC_NAMES.index("Jaccard")]
    d  = feats[METRIC_NAMES.index("Dice")]
    co = feats[METRIC_NAMES.index("Cosine")]
    lv = feats[METRIC_NAMES.index("LevenshteinRatio")]
 
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
    n_feats = X.shape[1]    # 16 from compare.js
 
    print("\n" + "=" * 65)
    print(f"  TRAINING POOL SUMMARY  ({int(TRAIN_FILE_RATIO*100)}% of base files)")
    print("=" * 65)
    print(f"  Total pairs      : {len(y)}")
    for c, name in enumerate(CLASS_NAMES):
        print(f"    {name:<14}: {int((y == c).sum())}")
    print(f"  Features ({n_feats})   : {METRIC_NAMES}")
    print(f"  Labels           : filename ground truth (no threshold bias)")
    print(f"\n  Random Forest config:")
    print(f"    n_estimators   : {RF_N_ESTIMATORS}")
    print(f"    criterion      : {RF_CRITERION}")
    print(f"    max_depth      : {RF_MAX_DEPTH if RF_MAX_DEPTH else 'None (unlimited)'}")
    print(f"    max_features   : {RF_MAX_FEATURES}")
    print(f"    bootstrap      : {RF_BOOTSTRAP}")
    print(f"    oob_score      : {RF_OOB_SCORE}")
    print(f"    class_weight   : {RF_CLASS_WEIGHT if RF_CLASS_WEIGHT else 'None (uniform)'}")
 
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
 
    # ── Scale ──────────────────────────────────────────────────
    scaler     = StandardScaler()
    X_train_sc = scaler.fit_transform(X_train)
    X_test_sc  = scaler.transform(X_test)
 
    # ── Random Forest ──────────────────────────────────────────
    oob = RF_OOB_SCORE and RF_BOOTSTRAP
    clf = RandomForestClassifier(
        n_estimators      = RF_N_ESTIMATORS,
        criterion         = RF_CRITERION,
        max_depth         = RF_MAX_DEPTH,
        min_samples_split = RF_MIN_SAMPLES_SPLIT,
        min_samples_leaf  = RF_MIN_SAMPLES_LEAF,
        max_features      = RF_MAX_FEATURES,
        bootstrap         = RF_BOOTSTRAP,
        oob_score         = oob,
        class_weight      = RF_CLASS_WEIGHT,
        n_jobs            = -1,
        random_state      = RANDOM_STATE,
    )
 
    print("\n" + "=" * 65)
    print(f"  TRAINING  (RandomForest  n_trees={RF_N_ESTIMATORS}  "
          f"max_features={RF_MAX_FEATURES}  — {n_feats} features)")
    print("=" * 65)
    clf.fit(X_train_sc, y_train)
    print("  Training completed.")
    if oob:
        print(f"  OOB score (generalisation estimate) : {clf.oob_score_:.4f}")
 
    # ── Evaluation ─────────────────────────────────────────────
    y_pred = clf.predict(X_test_sc)
    y_prob = clf.predict_proba(X_test_sc)   # shape (n_samples, 4)
 
    print("\n" + "=" * 65)
    print("  EVALUATION  (internal test set — 4 classes)")
    print("=" * 65)
    print(f"  Accuracy : {accuracy_score(y_test, y_pred):.4f}\n")
    print(classification_report(y_test, y_pred, target_names=CLASS_NAMES))
 
    cm = confusion_matrix(y_test, y_pred, labels=[0, 1, 2, 3])
    print("  Confusion Matrix (rows=truth, cols=predicted):")
    _print_confusion(cm)
 
    print("\n  Accuracy by class (test pairs):")
    _per_type_accuracy(y_test, y_pred, idx_test, pair_meta)
 
    # ── Feature importances ────────────────────────────────────
    importances = clf.feature_importances_
    std_imp     = np.std([t.feature_importances_ for t in clf.estimators_], axis=0)
    sorted_idx  = np.argsort(importances)[::-1]
    print("\n  Feature importances  (mean ± std across trees):")
    for i in sorted_idx:
        bar = "█" * int(importances[i] * 40)
        print(f"    {METRIC_NAMES[i]:<20} {importances[i]:.4f} ± {std_imp[i]:.4f}  {bar}")
 
    # ── n_estimators sensitivity ───────────────────────────────
    print("\n" + "=" * 65)
    print("  N_ESTIMATORS SENSITIVITY  (accuracy vs number of trees)")
    print("=" * 65)
    print(f"  {'trees':>6}   {'Test Acc':>9}   {'OOB Score':>10}")
    for n_trees in [1, 5, 10, 20, 50, 100, 200]:
        rf_n = RandomForestClassifier(
            n_estimators=n_trees, criterion=RF_CRITERION,
            max_depth=RF_MAX_DEPTH, max_features=RF_MAX_FEATURES,
            bootstrap=RF_BOOTSTRAP, oob_score=oob,
            class_weight=RF_CLASS_WEIGHT,
            n_jobs=-1, random_state=RANDOM_STATE,
        )
        rf_n.fit(X_train_sc, y_train)
        acc_n   = accuracy_score(y_test, rf_n.predict(X_test_sc))
        oob_str = f"{rf_n.oob_score_:.4f}" if oob else "N/A"
        marker  = "  ← current" if n_trees == RF_N_ESTIMATORS else ""
        print(f"  {n_trees:>6}   {acc_n:>9.4f}   {oob_str:>10}{marker}")
 
    # ── Most confident predictions (per class) ─────────────────
    print("\n  Most confident predictions (top 3 per class):")
    for c, cname in enumerate(CLASS_NAMES):
        prob_col = y_prob[:, c]
        top_idx  = np.argsort(prob_col)[::-1][:3]
        print(f"  {cname}:")
        for rank, i in enumerate(top_idx, 1):
            idx      = idx_test[i]
            base, clone, ctype, kind = pair_meta[idx]
            verdict  = CLASS_NAMES[y_pred[i]]
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
    print("  FINAL ACCURACY SUMMARY  (Random Forest)")
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
    global RF_N_ESTIMATORS, RF_CRITERION, RF_MAX_DEPTH
    global RF_MIN_SAMPLES_SPLIT, RF_MIN_SAMPLES_LEAF
    global RF_MAX_FEATURES, RF_BOOTSTRAP, RF_CLASS_WEIGHT, RF_OOB_SCORE
 
    parser = argparse.ArgumentParser(
        description="Plagiarism detector — Random Forest, 16-feature compare.js."
    )
    parser.add_argument("--n-estimators", type=int, default=RF_N_ESTIMATORS)
    parser.add_argument("--criterion",    type=str, default=RF_CRITERION,
                        choices=["gini", "entropy", "log_loss"])
    parser.add_argument("--max-depth",    type=int, default=None)
    parser.add_argument("--min-samples-split", type=int,
                        default=RF_MIN_SAMPLES_SPLIT)
    parser.add_argument("--min-samples-leaf",  type=int,
                        default=RF_MIN_SAMPLES_LEAF)
    parser.add_argument("--max-features", type=str, default=str(RF_MAX_FEATURES))
    parser.add_argument("--no-bootstrap", action="store_true")
    parser.add_argument("--class-weight", type=str, default=None,
                        choices=["balanced", "balanced_subsample"])
    parser.add_argument("--no-oob",       action="store_true")
    args = parser.parse_args()
 
    RF_N_ESTIMATORS      = args.n_estimators
    RF_CRITERION         = args.criterion
    RF_MAX_DEPTH         = args.max_depth
    RF_MIN_SAMPLES_SPLIT = args.min_samples_split
    RF_MIN_SAMPLES_LEAF  = args.min_samples_leaf
    RF_BOOTSTRAP         = not args.no_bootstrap
    RF_CLASS_WEIGHT      = args.class_weight
    RF_OOB_SCORE         = not args.no_oob
 
    mf = args.max_features
    if mf in ("sqrt", "log2"):
        RF_MAX_FEATURES = mf
    elif mf in ("None", "none"):
        RF_MAX_FEATURES = None
    else:
        try:
            RF_MAX_FEATURES = int(mf)
        except ValueError:
            try:
                RF_MAX_FEATURES = float(mf)
            except ValueError:
                RF_MAX_FEATURES = "sqrt"
 
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