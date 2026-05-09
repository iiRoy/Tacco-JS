import json
import random
import subprocess
import argparse
import time
import os
import hashlib
import numpy as np

from pathlib import Path
from collections import Counter
from concurrent.futures import ProcessPoolExecutor, as_completed

from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score


# ─────────────────────────────────────────────
#  Paths
# ─────────────────────────────────────────────

COMPARE_JS = Path("Vectorization/compare.js")
BASE_DIR = Path("dataset/dataset general/js_files")
CLONES_DIR = Path("dataset/dataset general/clones")

CACHE_DIR = Path(".cache")
FEATURE_CACHE = CACHE_DIR / "features_cache.npz"
META_CACHE = CACHE_DIR / "features_meta.json"


# ─────────────────────────────────────────────
#  Config
# ─────────────────────────────────────────────

CLONE_TYPES = [1, 2, 3]
COMPARE_MODE = 1  # 1=type, 2=value, 3=type-value
PLAGIARISM_THRESHOLD = 0.5
TRAIN_FILE_RATIO = 0.10
TEST_SIZE = 0.15
RANDOM_STATE = 42

# Ratio of negative non-clone pairs to generate per base file
NEGATIVES_PER_BASE = 3

METRIC_NAMES = [
    "Jaccard", "Dice", "LevenshteinRatio", "Jaro", "JaroWinkler",
    "Cosine", "Overlap", "LCSRatio", "NgramJaccard", "NgramDice",
    "GaussManhattan", "GaussEuclidean", "GaussMinkowski", "GaussChebyshev",
    "LengthRatio", "VocabularyRatio",
]


# ─────────────────────────────────────────────
#  Helpers
# ─────────────────────────────────────────────

def stable_hash(text: str) -> int:
    """
    Python's built-in hash() changes between runs.
    This gives deterministic sampling of negative pairs.
    """
    digest = hashlib.md5(text.encode("utf-8")).hexdigest()
    return int(digest[:8], 16)


def compare_with_js(file_a: Path, file_b: Path) -> list:
    if not COMPARE_JS.exists():
        raise FileNotFoundError(f"compare.js not found: {COMPARE_JS}")

    try:
        result = subprocess.run(
            [
                "node",
                str(COMPARE_JS),
                str(file_a),
                str(file_b),
                str(COMPARE_MODE),
            ],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="ignore",
            timeout=30,
        )

    except FileNotFoundError:
        raise RuntimeError("Node.js is not installed or not on PATH.")

    except subprocess.TimeoutExpired:
        print(f"  [TIMEOUT] {file_a.name} vs {file_b.name} — skipping")
        return []

    if result.returncode != 0:
        print(
            f"  [JS ERROR] {file_a.name} vs {file_b.name}: "
            f"{result.stderr.strip()[:160]}"
        )
        return []

    try:
        return json.loads(result.stdout.strip())
    except json.JSONDecodeError:
        print(
            f"  [JSON ERROR] {file_a.name} vs {file_b.name}: "
            f"{result.stdout.strip()[:160]}"
        )
        return []


def compute_pair(job: tuple):
    """
    Function executed in parallel.

    job format:
        (base_stem, clone_stem, ctype, label_mode)
    """
    base_stem, clone_stem, ctype, label_mode = job

    file_b = BASE_DIR / f"{base_stem}.js"
    file_c = CLONES_DIR / f"{clone_stem}.js"

    feats = compare_with_js(file_b, file_c)

    if not feats:
        return None

    if len(feats) != len(METRIC_NAMES):
        print(
            f"  [BAD FEATURES] {base_stem} vs {clone_stem}: "
            f"expected {len(METRIC_NAMES)}, got {len(feats)}"
        )
        return None

    if label_mode == "positive":
        label = 1 if feats[0] >= PLAGIARISM_THRESHOLD else 0
    else:
        label = 0

    return feats, label, (base_stem, clone_stem, ctype)


# ─────────────────────────────────────────────
#  Dataset Construction
# ─────────────────────────────────────────────

def build_jobs(base_stems: list, clones_dir: Path) -> tuple:
    all_clone_stems = [p.stem for p in sorted(clones_dir.glob("*.js"))]
    jobs = []
    skipped_missing = 0

    for base_stem in base_stems:
        # Positive pairs: real clones
        for ctype in CLONE_TYPES:
            clone_stem = f"{base_stem}_clon_{ctype}"
            file_c = clones_dir / f"{clone_stem}.js"

            if not file_c.exists():
                print(f"  [MISSING] {clone_stem}.js")
                skipped_missing += 1
                continue

            jobs.append((base_stem, clone_stem, ctype, "positive"))

        # Negative pairs: base file vs unrelated clones
        unrelated = [
            s for s in all_clone_stems
            if not s.startswith(f"{base_stem}_clon_")
        ]

        rng = random.Random(RANDOM_STATE + stable_hash(base_stem) % 10000)
        sampled = rng.sample(unrelated, min(NEGATIVES_PER_BASE, len(unrelated)))

        for neg_clone in sampled:
            jobs.append((base_stem, neg_clone, 0, "negative"))

    return jobs, skipped_missing


def build_dataset(base_stems: list, clones_dir: Path, workers: int) -> tuple:
    start_total = time.perf_counter()

    X, y, pair_meta = [], [], []

    jobs, skipped_missing = build_jobs(base_stems, clones_dir)

    if not jobs:
        return np.array(X), np.array(y), pair_meta

    print(f"\n  JS comparisons to run : {len(jobs)}")
    print(f"  Parallel workers      : {workers}")

    skipped_failed = 0
    completed = 0
    total = len(jobs)

    with ProcessPoolExecutor(max_workers=workers) as executor:
        futures = [executor.submit(compute_pair, job) for job in jobs]

        for future in as_completed(futures):
            completed += 1

            try:
                result = future.result()
            except Exception as exc:
                print(f"  [WORKER ERROR] {exc}")
                skipped_failed += 1
                continue

            if result is None:
                skipped_failed += 1
                continue

            feats, label, meta = result
            X.append(feats)
            y.append(label)
            pair_meta.append(meta)

            if completed % 100 == 0 or completed == total:
                print(f"  Progress: {completed}/{total}")

    positives = sum(1 for _, _, ctype in pair_meta if ctype in CLONE_TYPES)
    negatives = sum(1 for _, _, ctype in pair_meta if ctype == 0)

    elapsed = time.perf_counter() - start_total

    print(f"\n  Positive pairs (true clones) : {positives}")
    print(f"  Negative pairs (non-clones)  : {negatives}")
    print(f"  Skipped missing files        : {skipped_missing}")
    print(f"  Skipped failed comparisons   : {skipped_failed}")
    print(f"  Dataset build time           : {elapsed:.2f}s")

    return np.array(X), np.array(y), pair_meta


# ─────────────────────────────────────────────
#  Cache
# ─────────────────────────────────────────────

def save_cache(X, y, pair_meta, X_unseen, y_unseen, meta_unseen):
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    np.savez_compressed(
        FEATURE_CACHE,
        X=X,
        y=y,
        X_unseen=X_unseen,
        y_unseen=y_unseen,
    )

    with open(META_CACHE, "w", encoding="utf-8") as f:
        json.dump(
            {
                "pair_meta": pair_meta,
                "meta_unseen": meta_unseen,
                "config": {
                    "clone_types": CLONE_TYPES,
                    "compare_mode": COMPARE_MODE,
                    "plagiarism_threshold": PLAGIARISM_THRESHOLD,
                    "train_file_ratio": TRAIN_FILE_RATIO,
                    "test_size": TEST_SIZE,
                    "random_state": RANDOM_STATE,
                    "negatives_per_base": NEGATIVES_PER_BASE,
                },
            },
            f,
            indent=2,
        )

    print(f"\n  Cache saved:")
    print(f"    {FEATURE_CACHE}")
    print(f"    {META_CACHE}")


def load_cache():
    data = np.load(FEATURE_CACHE, allow_pickle=False)

    with open(META_CACHE, "r", encoding="utf-8") as f:
        meta = json.load(f)

    X = data["X"]
    y = data["y"]
    X_unseen = data["X_unseen"]
    y_unseen = data["y_unseen"]

    pair_meta = [tuple(item) for item in meta["pair_meta"]]
    meta_unseen = [tuple(item) for item in meta["meta_unseen"]]

    print(f"\n  Cache loaded:")
    print(f"    {FEATURE_CACHE}")
    print(f"    {META_CACHE}")

    return X, y, pair_meta, X_unseen, y_unseen, meta_unseen


# ─────────────────────────────────────────────
#  Output Helpers
# ─────────────────────────────────────────────

def _verdict_line(base, clone, ctype, feats, pred, truth=None):
    j = feats[0]
    d = feats[1]
    cos = feats[5]
    lev = feats[2]

    verdict = "PLAGIARIZED" if pred == 1 else "clean"
    clone_tag = f"[Type {ctype}]" if ctype > 0 else "[neg]"

    row = (
        f"  {base:<25} {clone:<32} {clone_tag:<9} "
        f"J:{j:.3f} D:{d:.3f} Cos:{cos:.3f} Lev:{lev:.3f}  "
        f"{verdict:<12}"
    )

    if truth is not None:
        true_l = "PLAGIARIZED" if truth == 1 else "clean"
        flag = "OK" if pred == truth else "WRONG"
        row += f"  truth:{true_l:<12} {flag}"

    return row


def _print_header(with_truth=False):
    base_hdr = (
        f"  {'Base':<25} {'Clone':<32} {'CloneType':<9} "
        f"{'Jaccard':>9} {'Dice':>7} {'Cosine':>8} {'Lev':>7}  "
        f"{'Verdict':<12}"
    )

    if with_truth:
        base_hdr += "  Truth"

    print(base_hdr)
    print("  " + "-" * (len(base_hdr) + 5))


def _print_all_pairs(X, y, pair_meta):
    _print_header(with_truth=True)

    for i, (base, clone, ctype) in enumerate(pair_meta):
        print(_verdict_line(base, clone, ctype, X[i], int(y[i]), truth=int(y[i])))


# ─────────────────────────────────────────────
#  Training & Evaluation
# ─────────────────────────────────────────────

def train_and_evaluate(
    X: np.ndarray,
    y: np.ndarray,
    pair_meta: list,
    X_unseen: np.ndarray,
    y_unseen: np.ndarray,
    meta_unseen: list,
    show_tables: bool,
):
    n_feats = len(METRIC_NAMES)

    print("\n" + "=" * 65)
    print(f"  TRAINING POOL SUMMARY  ({int(TRAIN_FILE_RATIO * 100)}% of base files)")
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

        if show_tables:
            _print_all_pairs(X, y, pair_meta)

        return

    if min(Counter(y).values()) < 2:
        print(
            "\n[WARNING] Not enough samples per class to split — need at least "
            "2 per class. Increase --train-ratio or lower --threshold."
        )

        if show_tables:
            _print_all_pairs(X, y, pair_meta)

        return

    # Split
    indices = list(range(len(y)))

    X_train, X_test, y_train, y_test, idx_train, idx_test = train_test_split(
        X,
        y,
        indices,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        stratify=y,
    )

    # XGBoost
    clf = XGBClassifier(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=4,
        subsample=0.8,
        colsample_bytree=0.8,
        reg_lambda=1.0,
        eval_metric="logloss",
        random_state=RANDOM_STATE,
        verbosity=0,

        # Performance options
        n_jobs=-1,
        tree_method="hist",
    )

    print("\n" + "=" * 65)
    print("  TRAINING  (XGBoost — 16 features)")
    print("=" * 65)

    t0 = time.perf_counter()

    clf.fit(
        X_train,
        y_train,
        eval_set=[(X_train, y_train), (X_test, y_test)],
        verbose=False,
    )

    train_time = time.perf_counter() - t0
    print(f"  Training completed in {train_time:.2f}s.")

    # Internal evaluation
    y_pred = clf.predict(X_test)

    print("\n" + "=" * 65)
    print("  EVALUATION  (internal test set)")
    print("=" * 65)
    print(f"  Accuracy : {accuracy_score(y_test, y_pred):.4f}\n")

    print(
        classification_report(
            y_test,
            y_pred,
            target_names=["Clean (0)", "Plagiarized (1)"],
            zero_division=0,
        )
    )

    cm = confusion_matrix(y_test, y_pred)

    print("  Confusion Matrix:")
    print("               Pred Clean  Pred Plagiarized")
    print(f"  True Clean         {cm[0, 0]:>5}            {cm[0, 1]:>5}")
    print(f"  True Plagiarized   {cm[1, 0]:>5}            {cm[1, 1]:>5}")

    print("\n  Accuracy by clone type (test pairs):")

    for ctype in CLONE_TYPES:
        ct_idx = [i for i, idx in enumerate(idx_test) if pair_meta[idx][2] == ctype]

        if not ct_idx:
            print(f"    Type {ctype}: no test pairs")
            continue

        acc = accuracy_score(y_test[ct_idx], y_pred[ct_idx])
        print(f"    Type {ctype}: {len(ct_idx)} pairs  accuracy={acc:.4f}")

    if show_tables:
        print("\n" + "=" * 65)
        print("  PER-PAIR RESULTS  (internal test set)")
        print("=" * 65)

        _print_header(with_truth=True)

        for i, idx in enumerate(idx_test):
            base, clone, ctype = pair_meta[idx]
            print(_verdict_line(base, clone, ctype, X[idx], y_pred[i], truth=y_test[i]))

        print("\n" + "=" * 65)
        print("  FULL PREDICTION TABLE  (training pool)")
        print("=" * 65)

        all_pred = clf.predict(X)

        _print_header(with_truth=False)

        for i, (base, clone, ctype) in enumerate(pair_meta):
            print(_verdict_line(base, clone, ctype, X[i], all_pred[i]))

    # Unseen evaluation
    if len(X_unseen) > 0:
        print("\n" + "=" * 65)
        print(f"  UNSEEN FILES PREDICTIONS  (remaining {int((1 - TRAIN_FILE_RATIO) * 100)}%)")
        print("=" * 65)

        unseen_pred = clf.predict(X_unseen)

        if len(set(y_unseen)) >= 2:
            print(f"  Accuracy on unseen : {accuracy_score(y_unseen, unseen_pred):.4f}\n")

            print(
                classification_report(
                    y_unseen,
                    unseen_pred,
                    target_names=["Clean (0)", "Plagiarized (1)"],
                    zero_division=0,
                )
            )
        else:
            print("  Only one class in unseen labels — skipping metrics.\n")

        if show_tables:
            _print_header(with_truth=True)

            for i, (base, clone, ctype) in enumerate(meta_unseen):
                print(
                    _verdict_line(
                        base,
                        clone,
                        ctype,
                        X_unseen[i],
                        unseen_pred[i],
                        truth=y_unseen[i],
                    )
                )


# ─────────────────────────────────────────────
#  Entry Point
# ─────────────────────────────────────────────

def main():
    global PLAGIARISM_THRESHOLD
    global TRAIN_FILE_RATIO
    global NEGATIVES_PER_BASE

    parser = argparse.ArgumentParser(
        description="Optimized plagiarism detector — 16 JS metrics + XGBoost."
    )

    parser.add_argument(
        "--threshold",
        type=float,
        default=PLAGIARISM_THRESHOLD,
        help=f"Jaccard threshold to label a pair plagiarized. Default: {PLAGIARISM_THRESHOLD}",
    )

    parser.add_argument(
        "--train-ratio",
        type=float,
        default=TRAIN_FILE_RATIO,
        help=f"Ratio of base files used for training pool. Default: {TRAIN_FILE_RATIO}",
    )

    parser.add_argument(
        "--negatives-per-base",
        type=int,
        default=NEGATIVES_PER_BASE,
        help=f"Negative pairs per base file. Default: {NEGATIVES_PER_BASE}",
    )

    parser.add_argument(
        "--workers",
        type=int,
        default=os.cpu_count() or 4,
        help="Parallel workers for JS comparisons. Default: CPU count.",
    )

    parser.add_argument(
        "--use-cache",
        action="store_true",
        help="Load features from cache instead of rebuilding them.",
    )

    parser.add_argument(
        "--save-cache",
        action="store_true",
        help="Save generated features to cache.",
    )

    parser.add_argument(
        "--rebuild-cache",
        action="store_true",
        help="Ignore existing cache and rebuild features.",
    )

    parser.add_argument(
        "--show-tables",
        action="store_true",
        help="Print long per-pair prediction tables.",
    )

    args = parser.parse_args()

    PLAGIARISM_THRESHOLD = args.threshold
    TRAIN_FILE_RATIO = args.train_ratio
    NEGATIVES_PER_BASE = args.negatives_per_base

    if args.workers < 1:
        print("\n[ERROR] --workers must be >= 1")
        return

    if not 0 < TRAIN_FILE_RATIO < 1:
        print("\n[ERROR] --train-ratio must be between 0 and 1.")
        return

    if not COMPARE_JS.exists():
        print(f"\n[ERROR] compare.js not found: {COMPARE_JS}")
        return

    if not BASE_DIR.exists():
        print(f"\n[ERROR] Base directory not found: {BASE_DIR}")
        return

    if not CLONES_DIR.exists():
        print(f"\n[ERROR] Clones directory not found: {CLONES_DIR}")
        return

    if args.use_cache and not args.rebuild_cache:
        if FEATURE_CACHE.exists() and META_CACHE.exists():
            X, y, pair_meta, X_unseen, y_unseen, meta_unseen = load_cache()

            train_and_evaluate(
                X,
                y,
                pair_meta,
                X_unseen,
                y_unseen,
                meta_unseen,
                show_tables=args.show_tables,
            )

            print("\n[DONE]\n")
            return

        print("\n[WARNING] Cache not found. Rebuilding features.")

    all_base_stems = sorted(p.stem for p in BASE_DIR.glob("*.js"))

    if not all_base_stems:
        print("\n[ERROR] No base .js files found.")
        return

    random.seed(RANDOM_STATE)
    random.shuffle(all_base_stems)

    n_train_files = max(1, round(len(all_base_stems) * TRAIN_FILE_RATIO))
    train_stems = all_base_stems[:n_train_files]
    unseen_stems = all_base_stems[n_train_files:]

    print("\n" + "=" * 65)
    print("  FILE SPLIT")
    print("=" * 65)
    print(f"  Total base files        : {len(all_base_stems)}")
    print(f"  Training pool ({int(TRAIN_FILE_RATIO * 100):>2}%)  : {len(train_stems)} files")
    print(f"  Unseen pool   ({int((1 - TRAIN_FILE_RATIO) * 100):>2}%)  : {len(unseen_stems)} files")

    print("\n" + "=" * 65)
    print(f"  BUILDING TRAINING DATASET  ({int(TRAIN_FILE_RATIO * 100)}% of files)")
    print("=" * 65)

    X, y, pair_meta = build_dataset(train_stems, CLONES_DIR, workers=args.workers)

    if len(X) == 0:
        print("\n[ERROR] No pairs built. Check clone filenames: <base>_clon_<1|2|3>.js")
        return

    print("\n" + "=" * 65)
    print(f"  BUILDING UNSEEN DATASET  (remaining {int((1 - TRAIN_FILE_RATIO) * 100)}% of files)")
    print("=" * 65)

    X_unseen, y_unseen, meta_unseen = build_dataset(unseen_stems, CLONES_DIR, workers=args.workers)

    if args.save_cache or args.rebuild_cache:
        save_cache(X, y, pair_meta, X_unseen, y_unseen, meta_unseen)

    train_and_evaluate(
        X,
        y,
        pair_meta,
        X_unseen,
        y_unseen,
        meta_unseen,
        show_tables=args.show_tables,
    )

    print("\n[DONE]\n")


if __name__ == "__main__":
    main()
