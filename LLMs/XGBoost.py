import sys
import json
import random
import subprocess
import argparse
import numpy as np
from pathlib import Path
from collections import Counter
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

# ─────────────────────────────────────────────
#  Paths
# ─────────────────────────────────────────────

COMPARE_JS = Path("Vectorization/compare.js")
BASE_DIR   = Path("dataset_copy/dataset general/js_files")
CLONES_DIR = Path("dataset_copy/dataset general/clones")

CLONE_TYPES          = [1, 2, 3]
COMPARE_MODE         = 1  # 1=type, 2=value, 3=type-value
PLAGIARISM_THRESHOLD = 0.5
TRAIN_FILE_RATIO     = 0.10
TEST_SIZE            = 0.15
RANDOM_STATE         = 42

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
    X, y, pair_meta = [], [], []

    all_clone_stems = [p.stem for p in sorted(clones_dir.glob("*.js"))]
    matched = skipped = negatives = 0

    total = len(base_stems)
    for idx, base_stem in enumerate(base_stems, 1):
        print(f"  [{idx}/{total}] {base_stem}.js", flush=True)
        file_b = BASE_DIR / f"{base_stem}.js"

        # ── Positive pairs: true clones ──────────────────────────
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
            label = 1 if feats[0] >= PLAGIARISM_THRESHOLD else 0
            X.append(feats)
            y.append(label)
            pair_meta.append((base_stem, clone_stem, ctype))
            matched += 1

        # ── Negative pairs: base file vs unrelated clones ─────────
        unrelated = [
            s for s in all_clone_stems
            if not s.startswith(f"{base_stem}_clon_")
        ]
        random.seed(RANDOM_STATE + hash(base_stem) % 10000)
        sampled = random.sample(unrelated, min(NEGATIVES_PER_BASE, len(unrelated)))
        for neg_clone in sampled:
            file_n = clones_dir / f"{neg_clone}.js"
            feats = compare_with_js(file_b, file_n)
            if not feats:
                continue
            X.append(feats)
            y.append(0)
            pair_meta.append((base_stem, neg_clone, 0))
            negatives += 1

    print(f"\n  Positive pairs (true clones) : {matched}")
    print(f"  Negative pairs (non-clones)  : {negatives}")
    print(f"  Skipped (missing files)      : {skipped}")
    return np.array(X), np.array(y), pair_meta


# ─────────────────────────────────────────────
#  Output Helpers
# ─────────────────────────────────────────────

def _verdict_line(base, clone, ctype, feats, pred, truth=None):
    j   = feats[0]   # Jaccard
    d   = feats[1]   # Dice
    cos = feats[5]   # Cosine
    lev = feats[2]   # LevenshteinRatio

    verdict   = "PLAGIARIZED" if pred == 1 else "clean"
    clone_tag = f"[Type {ctype}]" if ctype > 0 else "[neg]"

    row = (f"  {base:<25} {clone:<32} {clone_tag:<9} "
           f"J:{j:.3f} D:{d:.3f} Cos:{cos:.3f} Lev:{lev:.3f}  "
           f"{verdict:<12}")

    if truth is not None:
        true_l = "PLAGIARIZED" if truth == 1 else "clean"
        flag   = "OK" if pred == truth else "WRONG"
        row += f"  truth:{true_l:<12} {flag}"

    return row


def _print_header(with_truth=False):
    base_hdr = (f"  {'Base':<25} {'Clone':<32} {'CloneType':<9} "
                f"{'Jaccard':>9} {'Dice':>7} {'Cosine':>8} {'Lev':>7}  "
                f"{'Verdict':<12}")
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
    print(f"  Plagiarized (1)  : {int(y.sum())}")
    print(f"  Clean (0)        : {int((y == 0).sum())}")
    print(f"  Features ({n_feats})    : {METRIC_NAMES}")
    print(f"  Threshold        : {PLAGIARISM_THRESHOLD}  (on Jaccard index 0)")

    print("\n  Pairs by clone type:")
    for ctype in CLONE_TYPES:
        idx = [i for i, (_, _, t) in enumerate(pair_meta) if t == ctype]
        plag = int(y[idx].sum()) if idx else 0
        print(f"    Type {ctype}: {len(idx)} pairs  ({plag} labeled plagiarized)")

    if len(set(y)) < 2:
        print("\n[WARNING] Only one class in labels — adjust --threshold.")
        _print_all_pairs(X, y, pair_meta)
        return

    if min(Counter(y).values()) < 2:
        print("\n[WARNING] Not enough samples per class to split — need at least 2 per class. Increase --train-ratio or lower --threshold.")
        _print_all_pairs(X, y, pair_meta)
        return

    n_test = max(1, round(len(y) * TEST_SIZE))
    if n_test < len(set(y)):
        print(f"\n[WARNING] Test set too small ({n_test} sample(s)) for {len(set(y))} classes — increase --train-ratio.")
        _print_all_pairs(X, y, pair_meta)
        return

    # ── Split ──────────────────────────────────────────────────
    indices = list(range(len(y)))
    X_train, X_test, y_train, y_test, idx_train, idx_test = train_test_split(
        X, y, indices,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        stratify=y,
    )

    # ── XGBoost ────────────────────────────────────
    clf = XGBClassifier(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=4,
        subsample=0.8,
        colsample_bytree=0.8,
        reg_lambda=1.0,
        eval_metric='logloss',
        random_state=RANDOM_STATE,
        verbosity=0
    )

    print("\n" + "=" * 65)
    print("  TRAINING  (XGBoost — 16 features)")
    print("=" * 65)

    clf.fit(
        X_train, y_train,
        eval_set=[(X_train, y_train), (X_test, y_test)],
        verbose=False
    )

    print("  Training completed.")

    # ── Eval metrics ───────────────────────────────────────────
    y_pred = clf.predict(X_test)

    print("\n" + "=" * 65)
    print("  EVALUATION  (internal test set)")
    print("=" * 65)
    print(f"  Accuracy : {accuracy_score(y_test, y_pred):.4f}\n")
    print(classification_report(y_test, y_pred,
                                 target_names=["Clean (0)", "Plagiarized (1)"],
                                 labels=[0, 1], zero_division=0))

    cm = confusion_matrix(y_test, y_pred, labels=[0, 1])
    print("  Confusion Matrix:")
    print(f"               Pred Clean  Pred Plagiarized")
    print(f"  True Clean         {cm[0,0]:>5}            {cm[0,1]:>5}")
    print(f"  True Plagiarized   {cm[1,0]:>5}            {cm[1,1]:>5}")

    print("\n  Accuracy by clone type (test pairs):")
    for ctype in CLONE_TYPES:
        ct_idx = [i for i, idx in enumerate(idx_test) if pair_meta[idx][2] == ctype]
        if not ct_idx:
            print(f"    Type {ctype}: no test pairs")
            continue
        acc = accuracy_score(y_test[ct_idx], y_pred[ct_idx])
        print(f"    Type {ctype}: {len(ct_idx)} pairs  accuracy={acc:.4f}")

    # ── Test pair detail ───────────────────────────────────────
    print("\n" + "=" * 65)
    print("  PER-PAIR RESULTS  (internal test set)")
    print("=" * 65)
    _print_header(with_truth=True)
    for i, idx in enumerate(idx_test):
        base, clone, ctype = pair_meta[idx]
        print(_verdict_line(base, clone, ctype, X[idx], y_pred[i], truth=y_test[i]))

    # ── Full training pool table ───────────────────────────────
    print("\n" + "=" * 65)
    print("  FULL PREDICTION TABLE  (training pool)")
    print("=" * 65)
    all_pred = clf.predict(X)
    _print_header(with_truth=False)
    for i, (base, clone, ctype) in enumerate(pair_meta):
        print(_verdict_line(base, clone, ctype, X[i], all_pred[i]))

    # ── Unseen pool predictions ────────────────────────────────
    if len(X_unseen) > 0:
        print("\n" + "=" * 65)
        print(f"  UNSEEN FILES PREDICTIONS  (remaining {int((1-TRAIN_FILE_RATIO)*100)}%)")
        print("=" * 65)

        unseen_pred = clf.predict(X_unseen)

        if len(set(y_unseen)) >= 2:
            print(f"  Accuracy on unseen : {accuracy_score(y_unseen, unseen_pred):.4f}\n")
            print(classification_report(y_unseen, unseen_pred,
                                         target_names=["Clean (0)", "Plagiarized (1)"],
                                         labels=[0, 1], zero_division=0))
        else:
            print("  (Only one class in unseen labels — skipping metrics)\n")

        _print_header(with_truth=True)
        for i, (base, clone, ctype) in enumerate(meta_unseen):
            print(_verdict_line(base, clone, ctype, X_unseen[i],
                                unseen_pred[i], truth=y_unseen[i]))

def _print_all_pairs(X, y, pair_meta):
    _print_header(with_truth=True)
    for i, (base, clone, ctype) in enumerate(pair_meta):
        print(_verdict_line(base, clone, ctype, X[i], int(y[i]), truth=int(y[i])))


# ─────────────────────────────────────────────
#  Entry Point
# ─────────────────────────────────────────────

class _Tee:
    def __init__(self, *streams):
        self._streams = streams
    def write(self, data):
        for s in self._streams:
            s.write(data)
    def flush(self):
        for s in self._streams:
            s.flush()

def main():
    global PLAGIARISM_THRESHOLD

    parser = argparse.ArgumentParser(
        description="Plagiarism detector — 16 JS metrics + XGBoost."
    )
    parser.add_argument(
        "--threshold", type=float, default=PLAGIARISM_THRESHOLD,
        help=f"Jaccard threshold to label a pair plagiarized (default: {PLAGIARISM_THRESHOLD})."
    )
    args = parser.parse_args()
    PLAGIARISM_THRESHOLD = args.threshold

    log_dir = Path("LLMs/logs")
    log_dir.mkdir(parents=True, exist_ok=True)
    log_path = log_dir / "XGBoost.log"
    _log_file = open(log_path, "w", encoding="utf-8")
    _orig_stdout = sys.stdout
    sys.stdout = _Tee(_orig_stdout, _log_file)
    try:
        _main_body()
    finally:
        sys.stdout = _orig_stdout
        _log_file.close()
    _orig_stdout.write(f"\n[LOG] {log_path}\n")

def _main_body():
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
