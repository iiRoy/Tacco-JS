import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np

CACHE_DIR = Path(".cache")
FEATURE_CACHE = CACHE_DIR / "rf_features_cache.npz"
META_CACHE = CACHE_DIR / "rf_features_meta.json"
OUT_DIR = Path("LLMs/plots")

DEFAULT_METRIC_NAMES = [
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
]

CLASS_LABELS = [1, 2, 3, 4]
CLASS_NAMES = ["Type 1", "Type 2", "Type 3", "Type 4"]
COLORS = ["#4CAF50", "#2196F3", "#FF9800", "#F44336"]


def load_metric_names(width: int) -> list[str]:
    metric_names = DEFAULT_METRIC_NAMES

    if META_CACHE.exists():
        try:
            with open(META_CACHE, "r", encoding="utf-8") as handle:
                metadata = json.load(handle)
            configured_names = metadata.get("config", {}).get("metric_names")
            if isinstance(configured_names, list) and configured_names:
                metric_names = [str(name) for name in configured_names]
        except (OSError, json.JSONDecodeError):
            metric_names = DEFAULT_METRIC_NAMES

    if len(metric_names) == width:
        return metric_names

    print(
        f"[WARN] Metric name count ({len(metric_names)}) does not match "
        f"feature width ({width}). Using generic feature names."
    )
    return [f"Feature_{index + 1}" for index in range(width)]


def load_feature_cache() -> tuple[np.ndarray, np.ndarray]:
    if not FEATURE_CACHE.exists():
        raise FileNotFoundError(f"Feature cache not found: {FEATURE_CACHE}")

    data = np.load(FEATURE_CACHE, allow_pickle=False)
    parts_x = [data["X"]]
    parts_y = [data["y"]]

    if "X_unseen" in data.files and len(data["X_unseen"]) > 0:
        parts_x.append(data["X_unseen"])
        parts_y.append(data["y_unseen"])

    X = np.concatenate(parts_x, axis=0)
    y = np.concatenate(parts_y, axis=0)
    return X, y


def safe_class_stats(X: np.ndarray, y: np.ndarray, label: int) -> tuple[np.ndarray, np.ndarray]:
    subset = X[y == label]
    if len(subset) == 0:
        return np.zeros(X.shape[1]), np.zeros(X.shape[1])
    return subset.mean(axis=0), subset.std(axis=0)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    X, y = load_feature_cache()
    metric_names = load_metric_names(X.shape[1])
    print(f"Loaded {len(y)} pairs with {X.shape[1]} features")

    means = []
    stds = []
    for label in CLASS_LABELS:
        class_mean, class_std = safe_class_stats(X, y, label)
        means.append(class_mean)
        stds.append(class_std)

    means = np.array(means)
    stds = np.array(stds)

    x = np.arange(X.shape[1])
    width = 0.2
    fig, ax = plt.subplots(figsize=(max(18, X.shape[1] * 0.8), 7))

    for idx, (name, color) in enumerate(zip(CLASS_NAMES, COLORS)):
        offset = (idx - 1.5) * width
        ax.bar(
            x + offset,
            means[idx],
            width,
            yerr=stds[idx],
            capsize=2,
            label=name,
            color=color,
            alpha=0.85,
            error_kw={"elinewidth": 0.8, "alpha": 0.5},
        )

    ax.set_xticks(x)
    ax.set_xticklabels(metric_names, rotation=45, ha="right", fontsize=8)
    ax.set_ylabel("Similitud promedio (0-1)")
    ax.set_ylim(0, 1.15)

    ax.legend(fontsize=10)
    ax.grid(axis="y", alpha=0.3)
    ax.axhline(1.0, color="gray", linewidth=0.5, linestyle="--")

    fig.tight_layout()
    path = OUT_DIR / "similitud_por_tipo.png"
    fig.savefig(path, dpi=150)
    plt.close(fig)
    print(f"Guardado: {path}")


if __name__ == "__main__":
    main()
