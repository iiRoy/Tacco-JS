import json
import random
import subprocess
import argparse
import numpy as np
from pathlib import Path
from collections import Counter
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.preprocessing import StandardScaler

# ─────────────────────────────────────────────
#  Paths
# ─────────────────────────────────────────────

COMPARE_JS = Path("Vectorization/compare.js")
BASE_DIR   = Path("dataset_copy/dataset general/js_files")
CLONES_DIR = Path("dataset_copy/dataset general/clones")

CLONE_TYPES      = [1, 2, 3]
COMPARE_MODE     = 1  # 1=type, 2=value, 3=type-value
TRAIN_FILE_RATIO = 0.10
TEST_SIZE        = 0.10
RANDOM_STATE     = 42

# Ratio of negative (non-clone) pairs to generate per base file
NEGATIVES_PER_BASE = 3

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
            capture_output=True, text=True, encoding="utf-8", errors="ignore", timeout=30,
        )
    except FileNotFoundError:
        raise RuntimeError("Node.js is not installed or not on PATH.")
    except subprocess.TimeoutExpired:
        print(f"  [TIMEOUT] {file_a.name} vs {file_b.name} — skipping")
        return []
    if result.returncode != 0:
        print(f"  [JS ERROR] {file_a.name} vs {file_b.name}: {result.stderr.strip()[:120]}")
        return []
    return json.loads(result.stdout.strip())

# ─────────────────────────────────────────────
#  Dataset Construction
# ─────────────────────────────────────────────

def build_dataset(base_stems: list, clones_dir: Path) -> tuple:
    """
    Builds a MULTICLASS dataset with labels:
        0 → not plagiarized  (base file vs an unrelated clone)
        1 → Type 1 clone
        2 → Type 2 clone
        3 → Type 3 clone
    """
    X, y, pair_meta = [], [], []

    all_clone_stems = [p.stem for p in sorted(clones_dir.glob("*.js"))]
    matched = skipped = negatives = 0

    for base_stem in base_stems:
        file_b = BASE_DIR / f"{base_stem}.js"

        # ── Positive pairs: true clones (ground truth from filename) ──
        for ctype in CLONE_TYPES:
            clone_stem = f"{base_stem}_clon_{ctype}"
            file_c = clones_dir / f"{clone_stem}.js"
            if not file_c.exists():
                print(f"  [MISSING] {clone_stem}.js")
                skipped += 1
                continue
            feats = compare_with_js(file_b, file_c)
            if not feats:
                skipped += 1
                continue
            X.append(feats)
            y.append(ctype)          # label IS the clone type (1, 2, or 3)
            pair_meta.append((base_stem, clone_stem, ctype, "positive"))
            matched += 1

        # ── Negative pairs: base file vs unrelated clones ──────────
        unrelated = [
            s for s in all_clone_stems
            if not s.startswith(f"{base_stem}_clon_")
        ]
        random.seed(RANDOM_STATE + hash(base_stem) % 10000)
        sampled_negatives = random.sample(
            unrelated, min(NEGATIVES_PER_BASE, len(unrelated))
        )
        for neg_clone in sampled_negatives:
            file_n = clones_dir / f"{neg_clone}.js"
            feats = compare_with_js(file_b, file_n)
            if not feats:
                continue
            X.append(feats)
            y.append(0)              # label 0 = not a clone
            pair_meta.append((base_stem, neg_clone, 0, "negative"))
            negatives += 1

    print(f"\n  Positive pairs (true clones) : {matched}")
    print(f"  Negative pairs (non-clones)  : {negatives}")
    print(f"  Skipped (missing files)      : {skipped}")
    return np.array(X), np.array(y), pair_meta

# ─────────────────────────────────────────────
#  Output Helpers
# ─────────────────────────────────────────────

CLASS_NAMES = ["Clean (0)", "Type 1 (1)", "Type 2 (2)", "Type 3 (3)"]

def _verdict_line(base, clone, ctype, feats, pred, truth=None):
    j   = feats[0]   # Jaccard
    d   = feats[1]   # Dice
    cos = feats[5]   # Cosine
    lev = feats[2]   # LevenshteinRatio

    if pred == 0:
        verdict = "clean"
    else:
        verdict = f"PLAGIARIZED/T{pred}"

    clone_tag = f"[Type {ctype}]" if ctype > 0 else "[neg]"

    row = (f"  {base:<25} {clone:<32} {clone_tag:<9} "
           f"J:{j:.3f} D:{d:.3f} Cos:{cos:.3f} Lev:{lev:.3f}  "
           f"{verdict:<16}")

    if truth is not None:
        true_v = "clean" if truth == 0 else f"PLAGIARIZED/T{truth}"
        flag   = "OK" if pred == truth else "WRONG"
        row += f"  truth:{true_v:<16} {flag}"

    return row

def _print_header(with_truth=False):
    base_hdr = (f"  {'Base':<25} {'Clone':<32} {'PairType':<9} "
                f"{'Jaccard':>9} {'Dice':>7} {'Cosine':>8} {'Lev':>7}  "
                f"{'Verdict':<16}")
    if with_truth:
        base_hdr += "  Truth"
    print(base_hdr)
    print("  " + "-" * (len(base_hdr) + 5))

# ─────────────────────────────────────────────
#  Training & Evaluation
# ─────────────────────────────────────────────

def train_and_evaluate(
    X: np.ndarray, y: np.ndarray, pair_meta: list,
    X_unseen: np.ndarray, y_unseen: np.ndarray, meta_unseen: list,
):
    n_feats = len(METRIC_NAMES)   # 16

    print("\n" + "=" * 65)
    print(f"  TRAINING POOL SUMMARY  ({int(TRAIN_FILE_RATIO*100)}% of base files)")
    print("=" * 65)
    print(f"  Total pairs      : {len(y)}")
    for c, name in enumerate(CLASS_NAMES):
        print(f"    {name:<14}: {int((y == c).sum())}")
    print(f"  Features ({n_feats})    : {METRIC_NAMES}")
    print(f"  Label source     : filename ground truth (no threshold bias)")

    if len(set(y)) < 2:
        print("\n[WARNING] Only one class present — cannot train.")
        return

    if min(Counter(y).values()) < 2:
        print("\n[WARNING] Not enough samples per class to split — need at least 2 per class. Increase --train-ratio or lower --threshold.")
        return

    # ── Split ──────────────────────────────────────────────────
    indices = list(range(len(y)))
    X_train, X_test, y_train, y_test, idx_train, idx_test = train_test_split(
        X, y, indices,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        stratify=y,
    )

    # ── Scale ──────────────────────────────────────────────────
    scaler     = StandardScaler()
    X_train_sc = scaler.fit_transform(X_train)
    X_test_sc  = scaler.transform(X_test)

    # ── MLP ────────────────────────────────────────────────────
    clf = MLPClassifier(
        hidden_layer_sizes=(128, 64, 32),
        activation="relu",
        solver="adam",
        max_iter=500,
        random_state=RANDOM_STATE,
        early_stopping=True,
        validation_fraction=0.15,
        n_iter_no_change=20,
        verbose=False,
    )

    print("\n" + "=" * 65)
    print("  TRAINING  (MLPClassifier — 16 features, 4 classes)")
    print("=" * 65)
    clf.fit(X_train_sc, y_train)
    print(f"  Stopped at iteration  : {clf.n_iter_}")
    print(f"  Best validation score : {clf.best_validation_score_:.4f}")

    # ── Eval metrics ───────────────────────────────────────────
    y_pred = clf.predict(X_test_sc)

    print("\n" + "=" * 65)
    print("  EVALUATION  (internal test set)")
    print("=" * 65)
    print(f"  Accuracy : {accuracy_score(y_test, y_pred):.4f}\n")
    print(classification_report(y_test, y_pred, target_names=CLASS_NAMES))

    cm = confusion_matrix(y_test, y_pred, labels=[0, 1, 2, 3])
    print("  Confusion Matrix (rows=truth, cols=predicted):")
    print(f"  {'':>14} {'Clean':>8} {'Type1':>8} {'Type2':>8} {'Type3':>8}")
    for i, name in enumerate(["Clean", "Type 1", "Type 2", "Type 3"]):
        print(f"  {name:<14} {cm[i,0]:>8} {cm[i,1]:>8} {cm[i,2]:>8} {cm[i,3]:>8}")

    print("\n  Accuracy by clone type (test pairs):")
    for ctype in [0, 1, 2, 3]:
        ct_idx = [i for i, idx in enumerate(idx_test) if pair_meta[idx][2] == ctype]
        if not ct_idx:
            continue
        name = CLASS_NAMES[ctype]
        acc  = accuracy_score(y_test[ct_idx], y_pred[ct_idx])
        print(f"    {name}: {len(ct_idx)} pairs  accuracy={acc:.4f}")

    # ── Test pair detail ───────────────────────────────────────
    print("\n" + "=" * 65)
    print("  PER-PAIR RESULTS  (internal test set)")
    print("=" * 65)
    _print_header(with_truth=True)
    for i, idx in enumerate(idx_test):
        base, clone, ctype, _ = pair_meta[idx]
        print(_verdict_line(base, clone, ctype, X[idx], y_pred[i], truth=y_test[i]))

    # ── Full training pool table ───────────────────────────────
    print("\n" + "=" * 65)
    print("  FULL PREDICTION TABLE  (training pool)")
    print("=" * 65)
    all_pred = clf.predict(scaler.transform(X))
    _print_header(with_truth=False)
    for i, (base, clone, ctype, _) in enumerate(pair_meta):
        print(_verdict_line(base, clone, ctype, X[i], all_pred[i]))

    # ── Unseen pool predictions ────────────────────────────────
    if len(X_unseen) > 0:
        print("\n" + "=" * 65)
        print(f"  UNSEEN FILES PREDICTIONS  (remaining {int((1-TRAIN_FILE_RATIO)*100)}%)")
        print("=" * 65)

        unseen_pred = clf.predict(scaler.transform(X_unseen))

        if len(set(y_unseen)) >= 2:
            print(f"  Accuracy on unseen : {accuracy_score(y_unseen, unseen_pred):.4f}\n")
            print(classification_report(y_unseen, unseen_pred,
                                         target_names=CLASS_NAMES))
        else:
            print("  (Only one class in unseen labels — skipping metrics)\n")

        _print_header(with_truth=True)
        for i, (base, clone, ctype, _) in enumerate(meta_unseen):
            print(_verdict_line(base, clone, ctype, X_unseen[i],
                                unseen_pred[i], truth=y_unseen[i]))

def _print_all_pairs(X, y, pair_meta):
    _print_header(with_truth=True)
    for i, (base, clone, ctype, _) in enumerate(pair_meta):
        print(_verdict_line(base, clone, ctype, X[i], int(y[i]), truth=int(y[i])))


# ─────────────────────────────────────────────
#  Entry Point
# ─────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Plagiarism detector — 16 JS metrics + MLPClassifier."
    )
    args = parser.parse_args()

    if not COMPARE_JS.exists():
        print(f"\n[ERROR] compare.js not found: {COMPARE_JS}")
        return

    if not BASE_DIR.exists():
        print(f"\n[ERROR] Base directory not found: {BASE_DIR}")
        return

    all_base_stems = sorted(p.stem for p in BASE_DIR.glob("*.js"))
    if not all_base_stems:
        print("\n[ERROR] No base .js files found.")
        return

    random.seed(RANDOM_STATE)
    random.shuffle(all_base_stems)

    n_train_files = max(1, round(len(all_base_stems) * TRAIN_FILE_RATIO))
    train_stems   = all_base_stems[:n_train_files]
    unseen_stems  = all_base_stems[n_train_files:]

    print("\n" + "=" * 65)
    print("  FILE SPLIT")
    print("=" * 65)
    print(f"  Total base files        : {len(all_base_stems)}")
    print(f"  Training pool ({int(TRAIN_FILE_RATIO*100):>2}%)  : {len(train_stems)} files  {sorted(train_stems)}")
    print(f"  Unseen pool   ({int((1-TRAIN_FILE_RATIO)*100):>2}%)  : {len(unseen_stems)} files")

    print("\n" + "=" * 65)
    print(f"  BUILDING TRAINING DATASET  ({int(TRAIN_FILE_RATIO*100)}% of files)")
    print("=" * 65)
    X, y, pair_meta = build_dataset(train_stems, CLONES_DIR)

    if len(X) == 0:
        print("\n[ERROR] No pairs built. Check clone filenames: <base>_clon_<1|2|3>.js")
        return

    print("\n" + "=" * 65)
    print(f"  BUILDING UNSEEN DATASET  (remaining {int((1-TRAIN_FILE_RATIO)*100)}% of files)")
    print("=" * 65)
    X_unseen, y_unseen, meta_unseen = build_dataset(unseen_stems, CLONES_DIR)

    train_and_evaluate(X, y, pair_meta, X_unseen, y_unseen, meta_unseen)
    print("\n[DONE]\n")


if __name__ == "__main__":
    main()
