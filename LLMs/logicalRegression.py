import re
import random
import subprocess
import argparse
import numpy as np
from pathlib import Path
from collections import Counter
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.preprocessing import StandardScaler

# ─────────────────────────────────────────────
#  Paths
# ─────────────────────────────────────────────

TOKENIZER_JS = Path("Tokenizer/Tokenizer-Tokenizr.js")
BASE_DIR      = Path("dataset_copy/dataset general/js_files")
CLONES_DIR    = Path("dataset_copy/dataset general/clones")

CLONE_TYPES        = [1, 2, 3]
NGRAM_SIZES        = [1, 2, 3]
TRAIN_FILE_RATIO   = 0.50
TEST_SIZE          = 0.50
RANDOM_STATE       = 42
MINKOWSKI_P        = 2
GAUSS_SIGMA        = 1.0

# Ratio of negative (non-clone) pairs to generate per base file. Balances against full clone files
NEGATIVES_PER_BASE = 3

# ─────────────────────────────────────────────
#  JS Tokenizer
# ─────────────────────────────────────────────

_TOKEN_LINE = re.compile(r'^\[(\w+)\]\s+"(.*)"', re.MULTILINE)

def tokenize_with_js(filepath: Path) -> list:
    if not TOKENIZER_JS.exists():
        raise FileNotFoundError(f"Tokenizer not found: {TOKENIZER_JS}")
    try:
        result = subprocess.run(
            ["node", str(TOKENIZER_JS), str(filepath)],
            capture_output=True, text=True, timeout=30,
        )
    except FileNotFoundError:
        raise RuntimeError("Node.js is not installed or not on PATH.")
    except subprocess.TimeoutExpired:
        print(f"  [TIMEOUT] {filepath.name} — skipping")
        return []

    if result.returncode != 0:
        print(f"  [JS ERROR] {filepath.name}: {result.stderr.strip()[:120]}")
        return []

    tokens = []
    for match in _TOKEN_LINE.finditer(result.stdout):
        token_type  = match.group(1)
        token_value = match.group(2)
        if token_type == "EOF":
            continue
        tokens.append(f"{token_type}:{token_value}")
    return tokens


# ─────────────────────────────────────────────
#  N-gram Helpers
# ─────────────────────────────────────────────

def make_ngrams(tokens: list, n: int) -> set:
    if len(tokens) < n:
        return set()
    return set(zip(*[tokens[i:] for i in range(n)]))

def make_ngram_counts(tokens: list, n: int) -> Counter:
    if len(tokens) < n:
        return Counter()
    return Counter(zip(*[tokens[i:] for i in range(n)]))

def file_ngram_data(tokens: list) -> dict:
    return {
        n: {"set": make_ngrams(tokens, n), "counts": make_ngram_counts(tokens, n)}
        for n in NGRAM_SIZES
    }

# ─────────────────────────────────────────────
#  Similarity Metrics
# ─────────────────────────────────────────────

def jaccard(a: set, b: set) -> float:
    if not a and not b:
        return 1.0
    union = len(a | b)
    return len(a & b) / union if union else 0.0

def dice(a: set, b: set) -> float:
    if not a and not b:
        return 1.0
    denom = len(a) + len(b)
    return (2 * len(a & b)) / denom if denom else 0.0

def _aligned_vectors(ca: Counter, cb: Counter):
    vocab = list(ca.keys() | cb.keys())
    va = np.array([ca.get(k, 0) for k in vocab], dtype=float)
    vb = np.array([cb.get(k, 0) for k in vocab], dtype=float)
    return va, vb

def gauss_kernel(ca: Counter, cb: Counter, sigma: float = GAUSS_SIGMA) -> float:
    if not ca and not cb:
        return 1.0
    if not ca or not cb:
        return 0.0
    va, vb = _aligned_vectors(ca, cb)
    sq_dist = float(np.sum((va - vb) ** 2))
    return float(np.exp(-sq_dist / (2 * sigma ** 2)))

def minkowski_sim(ca: Counter, cb: Counter, p: int = MINKOWSKI_P) -> float:
    if not ca and not cb:
        return 1.0
    if not ca or not cb:
        return 0.0
    va, vb = _aligned_vectors(ca, cb)
    dist = float(np.sum(np.abs(va - vb) ** p) ** (1.0 / p))
    return 1.0 / (1.0 + dist)


# ─────────────────────────────────────────────
#  Feature Extraction  (4 metrics × 3 n-gram sizes = 12 features)
# ─────────────────────────────────────────────

METRIC_NAMES = ["Jaccard", "Dice", "Gauss", "Minkowski"]

def pair_features(data_a: dict, data_b: dict) -> list:
    feats = []
    for n in NGRAM_SIZES:
        sa, sb = data_a[n]["set"],    data_b[n]["set"]
        ca, cb = data_a[n]["counts"], data_b[n]["counts"]
        feats.append(jaccard(sa, sb))
        feats.append(dice(sa, sb))
        feats.append(gauss_kernel(ca, cb))
        feats.append(minkowski_sim(ca, cb))
    return feats

# ─────────────────────────────────────────────
#  File Loading
# ─────────────────────────────────────────────

def load_js_files(folder: Path, label: str) -> dict:
    if not folder.exists():
        raise FileNotFoundError(f"Folder not found: {folder}")
    files = {}
    for fpath in sorted(folder.glob("*.js")):
        tokens = tokenize_with_js(fpath)
        if tokens:
            files[fpath.stem] = tokens
            print(f"  [LOADED {label}] {fpath.name}  ({len(tokens)} tokens)")
        else:
            print(f"  [EMPTY/SKIP]    {fpath.name}  (0 tokens returned)")
    return files


# ─────────────────────────────────────────────
#  Dataset Construction
# ─────────────────────────────────────────────

def build_dataset(base_files: dict, clone_files: dict) -> tuple:
    """
    Builds a MULTICLASS dataset with labels:
        0 → not plagiarized  (base file vs an unrelated clone)
        1 → Type 1 clone
        2 → Type 2 clone
        3 → Type 3 clone
    """
    X, y, pair_meta = [], [], []

    ng_base   = {name: file_ngram_data(toks) for name, toks in base_files.items()}
    ng_clones = {name: file_ngram_data(toks) for name, toks in clone_files.items()}

    all_clone_stems = list(clone_files.keys())
    matched = skipped = negatives = 0

    for base_stem, data_b in ng_base.items():

        # ── Positive pairs: true clones, label = clone type ───
        for ctype in CLONE_TYPES:
            clone_stem = f"{base_stem}_clon_{ctype}"
            if clone_stem not in ng_clones:
                print(f"  [MISSING] {clone_stem}.js")
                skipped += 1
                continue
            feats = pair_features(data_b, ng_clones[clone_stem])
            X.append(feats)
            y.append(ctype)                                      # 1, 2, or 3
            pair_meta.append((base_stem, clone_stem, ctype, "positive"))
            matched += 1

        # ── Negative pairs: base file vs unrelated clones ──────────
        # Collect clones that do NOT belong to this base file
        unrelated = [
            s for s in all_clone_stems
            if not s.startswith(f"{base_stem}_clon_")
        ]
        random.seed(RANDOM_STATE + hash(base_stem) % 10000)
        sampled = random.sample(unrelated, min(NEGATIVES_PER_BASE, len(unrelated)))
        for neg_clone in sampled:
            feats = pair_features(data_b, ng_clones[neg_clone])
            X.append(feats)
            y.append(0)                                          # 0 = not a clone
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

def _verdict_line(base, clone, ctype, kind, feats, pred, truth=None):
    j_avg = float(np.mean([feats[n * 4 + 0] for n in range(len(NGRAM_SIZES))]))
    d_avg = float(np.mean([feats[n * 4 + 1] for n in range(len(NGRAM_SIZES))]))
    g_avg = float(np.mean([feats[n * 4 + 2] for n in range(len(NGRAM_SIZES))]))
    m_avg = float(np.mean([feats[n * 4 + 3] for n in range(len(NGRAM_SIZES))]))

    verdict  = "clean" if pred == 0 else f"PLAGIARIZED/T{pred}"
    pair_tag = f"[T{ctype}]" if ctype > 0 else "[neg]"

    row = (f"  {base:<22} {clone:<30} {pair_tag:<7} "
           f"J:{j_avg:.3f} D:{d_avg:.3f} G:{g_avg:.3f} M:{m_avg:.3f}  "
           f"{verdict:<16}")

    if truth is not None:
        true_v = "clean" if truth == 0 else f"PLAGIARIZED/T{truth}"
        flag   = "OK" if pred == truth else "WRONG"
        row   += f"  truth:{true_v:<16} {flag}"

    return row

def _print_header(with_truth=False):
    h = (f"  {'Base':<22} {'Clone':<30} {'Type':<7} "
         f"{'Jaccard':>9} {'Dice':>7} {'Gauss':>7} {'Minkowski':>10}  "
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
#  Single-classifier evaluation block
# ─────────────────────────────────────────────

def evaluate_classifier(
    name: str,
    clf,
    scaler: StandardScaler,
    X_train_sc, X_test_sc,
    y_train, y_test,
    idx_test,
    X, y, pair_meta,
    X_unseen, y_unseen, meta_unseen,
):

    # ── Train ──────────────────────────────────────────────────
    print("\n" + "=" * 65)
    print(f"  TRAINING  ({name})")
    print("=" * 65)
    clf.fit(X_train_sc, y_train)

    if hasattr(clf, "coef_"):
        # LogisticRegression
        print(f"  Converged in          : {clf.n_iter_[0]} iterations")
        print(f"  Intercepts            : {[f'{v:.3f}' for v in clf.intercept_]}")
        feat_labels = [f"{m[0]}_{n}g"
                       for n in NGRAM_SIZES
                       for m in METRIC_NAMES]
        print("  Feature weights (per class):")
        for c_idx, cname in enumerate(CLASS_NAMES):
            weights = ", ".join(
                f"{feat_labels[i]}:{clf.coef_[c_idx][i]:+.3f}"
                for i in range(len(feat_labels))
            )
            print(f"    {cname}: {weights}")

    # ── Internal test set evaluation ───────────────────────────
    y_pred = clf.predict(X_test_sc)

    print("\n" + "=" * 65)
    print(f"  EVALUATION  ({name} — internal test set)")
    print("=" * 65)
    print(f"  Accuracy : {accuracy_score(y_test, y_pred):.4f}\n")
    print(classification_report(y_test, y_pred, target_names=CLASS_NAMES))

    cm = confusion_matrix(y_test, y_pred, labels=[0, 1, 2, 3])
    print("  Confusion Matrix (rows=truth, cols=predicted):")
    _print_confusion(cm)

    print("\n  Accuracy by class (test pairs):")
    _per_type_accuracy(y_test, y_pred, idx_test, pair_meta)

    # ── Per-pair test detail ───────────────────────────────────
    print("\n" + "=" * 65)
    print(f"  PER-PAIR RESULTS  ({name} — internal test set)")
    print("=" * 65)
    _print_header(with_truth=True)
    for i, idx in enumerate(idx_test):
        base, clone, ctype, kind = pair_meta[idx]
        print(_verdict_line(base, clone, ctype, kind, X[idx], y_pred[i], truth=y_test[i]))

    # ── Full training pool table ───────────────────────────────
    print("\n" + "=" * 65)
    print(f"  FULL PREDICTION TABLE  ({name} — training pool)")
    print("=" * 65)
    all_pred = clf.predict(scaler.transform(X))
    _print_header(with_truth=False)
    for i, (base, clone, ctype, kind) in enumerate(pair_meta):
        print(_verdict_line(base, clone, ctype, kind, X[i], all_pred[i]))

    # ── Unseen pool ────────────────────────────────────────────
    if len(X_unseen) > 0:
        print("\n" + "=" * 65)
        print(f"  UNSEEN FILES  ({name} — remaining {int((1-TRAIN_FILE_RATIO)*100)}%)")
        print("=" * 65)
        unseen_pred = clf.predict(scaler.transform(X_unseen))

        if len(set(y_unseen)) >= 2:
            print(f"  Accuracy on unseen : {accuracy_score(y_unseen, unseen_pred):.4f}\n")
            print(classification_report(y_unseen, unseen_pred,
                                        target_names=CLASS_NAMES))
        else:
            print("  (Only one class in unseen set — skipping metrics)\n")

        _print_header(with_truth=True)
        for i, (base, clone, ctype, kind) in enumerate(meta_unseen):
            print(_verdict_line(base, clone, ctype, kind, X_unseen[i],
                                unseen_pred[i], truth=y_unseen[i]))

    return clf   # return fitted classifier for optional further use


# ─────────────────────────────────────────────
#  Main training & evaluation orchestrator
# ─────────────────────────────────────────────

def train_and_evaluate(
    X: np.ndarray, y: np.ndarray, pair_meta: list,
    X_unseen: np.ndarray, y_unseen: np.ndarray, meta_unseen: list,
):
    n_feats = len(NGRAM_SIZES) * len(METRIC_NAMES)   # 12

    print("\n" + "=" * 65)
    print(f"  TRAINING POOL SUMMARY  ({int(TRAIN_FILE_RATIO*100)}% of base files)")
    print("=" * 65)
    print(f"  Total pairs      : {len(y)}")
    for c, name in enumerate(CLASS_NAMES):
        print(f"    {name:<14}: {int((y == c).sum())}")
    print(f"  Features ({n_feats})    : {METRIC_NAMES} × n-grams {NGRAM_SIZES}")
    print(f"  Labels           : filename ground truth (no threshold bias)")

    if len(set(y)) < 2:
        print("\n[WARNING] Only one class present — cannot train.")
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

    # ── Logistic Regression ────────────────────────────────────
    lr = LogisticRegression(
        solver="lbfgs",
        max_iter=1000,
        C=1.0,
        random_state=RANDOM_STATE,
    )
    evaluate_classifier(
        "Logistic Regression", lr, scaler,
        X_train_sc, X_test_sc, y_train, y_test, idx_test,
        X, y, pair_meta, X_unseen, y_unseen, meta_unseen,
    )


# ─────────────────────────────────────────────
#  Entry Point
# ─────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Plagiarism detector — Jaccard+Dice+Gauss+Minkowski, Logistic Regression."
    )
    args = parser.parse_args()

    if not TOKENIZER_JS.exists():
        print(f"\n[ERROR] Tokenizer not found: {TOKENIZER_JS}")
        return

    print("\n" + "=" * 65)
    print("  LOADING FILES  (via JS tokenizer)")
    print("=" * 65)

    print(f"\n  Base files  ->  {BASE_DIR}")
    base_files = load_js_files(BASE_DIR, "BASE")

    print(f"\n  Clone files ->  {CLONES_DIR}")
    clone_files = load_js_files(CLONES_DIR, "CLONE")

    if not base_files:
        print("\n[ERROR] No base .js files loaded.")
        return
    if not clone_files:
        print("\n[ERROR] No clone .js files loaded.")
        return

    # ── File-level train / unseen split ───────────────────────
    all_base_stems = sorted(base_files.keys())
    random.seed(RANDOM_STATE)
    random.shuffle(all_base_stems)

    n_train   = max(1, round(len(all_base_stems) * TRAIN_FILE_RATIO))
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