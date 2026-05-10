import json
import random
import subprocess
import argparse
import numpy as np
from pathlib import Path
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score


# ─────────────────────────────────────────────
#  Paths
# ─────────────────────────────────────────────

COMPARE_JS = Path("Vectorization/compare.js")
BASE_DIR   = Path("dataset_copy/dataset general/js_files")
CLONES_DIR = Path("dataset_copy/dataset general/clones")

CLONE_TYPES        = [1, 2, 3]
COMPARE_MODE       = 1          # 1=type, 2=value, 3=type-value
TRAIN_FILE_RATIO   = 0.10
TEST_SIZE          = 0.15
RANDOM_STATE       = 42
NEGATIVES_PER_BASE = 3          # unrelated pairs per base file (label 0)

# Decision Tree hyperparameters
DT_CRITERION          = "gini"   # 'gini' | 'entropy' | 'log_loss'
DT_MAX_DEPTH          = None     # None = unlimited
DT_MIN_SAMPLES_SPLIT  = 2        # Min samples to split
DT_MIN_SAMPLES_LEAF   = 1        # Min samples at leaf
DT_MAX_FEATURES       = None     # None = all features
DT_CLASS_WEIGHT       = None     # None | 'balanced'


# ─────────────────────────────────────────────
#  JS Feature Extraction
# ─────────────────────────────────────────────

METRIC_NAMES = [
    "Jaccard", "Dice", "LevenshteinRatio", "Jaro", "JaroWinkler",
    "Cosine", "Overlap", "LCSRatio", "NgramJaccard", "NgramDice",
    "GaussManhattan", "GaussEuclidean", "GaussMinkowski", "GaussChebyshev",
    "LengthRatio", "VocabularyRatio",
]

def compare_with_js(file_a: Path, file_b: Path) -> list:
    """Call compare.js and return a list of 16 floats, or [] on error."""
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
    """Return {stem: Path} for every .js file in folder."""
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
    
    Labels from filename ground truth only:
        Positive pairs  →  label = clone type (1, 2, or 3)
        Negative pairs  →  label = 0
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
            y.append(ctype)                          # 1, 2, or 3
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
            y.append(0)                              # 0 = not a clone
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
    """Format one result row with 4 representative metrics."""
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
    """Print 4×4 confusion matrix for 4 classes."""
    labels = ["Clean", "Type1", "Type2", "Type3"]
    print(f"  {'':>14} " + " ".join(f"{l:>8}" for l in labels))
    for i, name in enumerate(labels):
        print(f"  {name:<14} " + " ".join(f"{cm[i, j]:>8}" for j in range(4)))


def _per_type_accuracy(y_true, y_pred, idx_test, pair_meta):
    """Print accuracy per class."""
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
    print(f"\n  Decision Tree config:")
    print(f"    criterion         : {DT_CRITERION}")
    print(f"    max_depth         : {DT_MAX_DEPTH if DT_MAX_DEPTH else 'None (unlimited)'}")
    print(f"    min_samples_split : {DT_MIN_SAMPLES_SPLIT}")
    print(f"    min_samples_leaf  : {DT_MIN_SAMPLES_LEAF}")
    print(f"    max_features      : {DT_MAX_FEATURES if DT_MAX_FEATURES else 'None (all)'}")
    print(f"    class_weight      : {DT_CLASS_WEIGHT if DT_CLASS_WEIGHT else 'None (uniform)'}")

    if len(set(y)) < 2:
        print("\n[WARNING] Only one class present — cannot train.")
        return

    # ── Split ──────────────────────────────────────────────────
    indices = list(range(len(y)))
    X_train, X_test, y_train, y_test, idx_train, idx_test = train_test_split(
        X, y, indices,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        # stratify omitted — avoids crash with < 2 members per class
    )

    # ── Note: Scaling NOT applied for Decision Trees ────────────
    # Trees don't require feature scaling (splits are threshold-based)
    # Using X directly instead of scaled version

    # ── Decision Tree ──────────────────────────────────────────
    clf = DecisionTreeClassifier(
        criterion         = DT_CRITERION,
        max_depth         = DT_MAX_DEPTH,
        min_samples_split = DT_MIN_SAMPLES_SPLIT,
        min_samples_leaf  = DT_MIN_SAMPLES_LEAF,
        max_features      = DT_MAX_FEATURES,
        class_weight      = DT_CLASS_WEIGHT,
        random_state      = RANDOM_STATE,
    )

    print("\n" + "=" * 65)
    print(f"  TRAINING  (DecisionTree criterion={DT_CRITERION} "
          f"max_depth={DT_MAX_DEPTH} — {n_feats} features, 4 classes)")
    print("=" * 65)
    clf.fit(X_train, y_train)
    print(f"  Training completed.")
    print(f"  Tree depth (actual)  : {clf.get_depth()}")
    print(f"  Number of leaves     : {clf.get_n_leaves()}")

    # ── Evaluation ─────────────────────────────────────────────
    y_pred = clf.predict(X_test)

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
    sorted_idx  = np.argsort(importances)[::-1]
    print("\n  Feature importances (Gini decrease, sorted):")
    for i in sorted_idx[:10]:
        bar = "█" * int(importances[i] * 40)
        print(f"    {METRIC_NAMES[i]:<20} {importances[i]:.4f}  {bar}")

    # ── Decision Tree text representation ───────────────────────
    print("\n" + "=" * 65)
    print("  DECISION TREE RULES  (text representation, depth ≤ 4)")
    print("=" * 65)
    tree_text = export_text(
        clf,
        feature_names=METRIC_NAMES,
        max_depth=4,
        show_weights=True,
    )
    print(tree_text)

    # ── Max depth sensitivity analysis ─────────────────────────
    print("\n" + "=" * 65)
    print("  MAX DEPTH SENSITIVITY  (accuracy vs max_depth on test set)")
    print("=" * 65)
    print(f"  {'depth':>6}   {'Accuracy':>9}   {'Leaves':>7}")
    for depth in [1, 2, 3, 4, 5, 6, 8, 10, None]:
        dt_d = DecisionTreeClassifier(
            criterion=DT_CRITERION,
            max_depth=depth,
            min_samples_split=DT_MIN_SAMPLES_SPLIT,
            min_samples_leaf=DT_MIN_SAMPLES_LEAF,
            random_state=RANDOM_STATE,
        )
        dt_d.fit(X_train, y_train)
        preds_d = dt_d.predict(X_test)
        acc_d   = accuracy_score(y_test, preds_d)
        leaves  = dt_d.get_n_leaves()
        depth_str = str(depth) if depth is not None else "None"
        marker = "  ← current" if depth == DT_MAX_DEPTH else ""
        print(f"  {depth_str:>6}   {acc_d:>9.4f}   {leaves:>7}{marker}")

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
    all_pred = clf.predict(X)
    _print_header(with_truth=False)
    for i, (base, clone, ctype, kind) in enumerate(pair_meta):
        print(_verdict_line(base, clone, ctype, kind, X[i], all_pred[i]))

    # ── Unseen pool predictions ────────────────────────────────
    if len(X_unseen) > 0:
        print("\n" + "=" * 65)
        print(f"  UNSEEN FILES PREDICTIONS  "
              f"(remaining {int((1-TRAIN_FILE_RATIO)*100)}%)")
        print("=" * 65)

        unseen_pred = clf.predict(X_unseen)

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
    print("  FINAL ACCURACY SUMMARY  (Decision Tree)")
    print("=" * 65)
    acc_train = accuracy_score(y_train, clf.predict(X_train))
    acc_test  = accuracy_score(y_test,  y_pred)
    if len(X_unseen) > 0:
        acc_unseen = accuracy_score(y_unseen, clf.predict(X_unseen))
        print(f"  train={acc_train:.4f}  test={acc_test:.4f}  "
              f"unseen={acc_unseen:.4f}")
    else:
        print(f"  train={acc_train:.4f}  test={acc_test:.4f}")


# ─────────────────────────────────────────────
#  Entry Point
# ─────────────────────────────────────────────

def main():
    global DT_CRITERION, DT_MAX_DEPTH, DT_MIN_SAMPLES_SPLIT
    global DT_MIN_SAMPLES_LEAF, DT_MAX_FEATURES, DT_CLASS_WEIGHT

    parser = argparse.ArgumentParser(
        description="Plagiarism detector — Decision Tree, 16-feature compare.js."
    )
    parser.add_argument("--criterion", type=str, default=DT_CRITERION,
                        choices=["gini", "entropy", "log_loss"])
    parser.add_argument("--max-depth", type=int, default=None)
    parser.add_argument("--min-samples-split", type=int,
                        default=DT_MIN_SAMPLES_SPLIT)
    parser.add_argument("--min-samples-leaf", type=int,
                        default=DT_MIN_SAMPLES_LEAF)
    parser.add_argument("--max-features", type=str, default=None)
    parser.add_argument("--class-weight", type=str, default=None,
                        choices=["balanced"])
    args = parser.parse_args()

    DT_CRITERION         = args.criterion
    DT_MAX_DEPTH         = args.max_depth
    DT_MIN_SAMPLES_SPLIT = args.min_samples_split
    DT_MIN_SAMPLES_LEAF  = args.min_samples_leaf
    DT_CLASS_WEIGHT      = args.class_weight

    # Parse max_features
    if args.max_features is None:
        DT_MAX_FEATURES = None
    elif args.max_features in ("sqrt", "log2"):
        DT_MAX_FEATURES = args.max_features
    else:
        try:
            DT_MAX_FEATURES = int(args.max_features)
        except ValueError:
            try:
                DT_MAX_FEATURES = float(args.max_features)
            except ValueError:
                DT_MAX_FEATURES = None

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