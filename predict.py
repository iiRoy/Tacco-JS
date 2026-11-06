# SPDX-FileCopyrightText: 2026 Rodrigo López Guerra
# SPDX-FileCopyrightText: 2026 Abigail Pérez García
# SPDX-FileCopyrightText: 2026 Fernando Maggi Llerandi
#
# SPDX-License-Identifier: Apache-2.0

#!/usr/bin/env python3
"""
Tacco JS pairwise prediction script.

Usage:
  python predict.py file1.js file2.js RF
  python predict.py file1.js file2.js XGB
  python predict.py file1.js file2.js NN

  # A custom .joblib path is still supported:
  python predict.py file1.js file2.js --model LLMs/Models/random_forest_model.joblib

Notes:
  - The current experimental scope classifies clone pairs as Type-I to Type-IV.
  - The originality verdict is relative to the compared file, not an absolute claim.
  - The confidence score is classifier confidence for the predicted clone type,
    not proof of plagiarism or dishonesty.
"""

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Any

import joblib
import numpy as np

PROJECT_DIR = Path(__file__).resolve().parent

SIMILARITY_JS = PROJECT_DIR / "Vectorization" / "similarity.js"
MODELS_DIR = PROJECT_DIR / "LLMs" / "Models"

MODEL_ALIASES = {
    "RF": MODELS_DIR / "random_forest_model.joblib",
    "XGB": MODELS_DIR / "xgboost_model.joblib",
    "NN": MODELS_DIR / "neural_network_model.joblib",
}

DEFAULT_MODEL_ALIAS = "RF"

# Full vector order produced by Vectorization/similarity.js and compare.js.
# 16 lexical/token metrics + 12 IR metrics + 3 normalized AST metrics + 3 CFG metrics = 34.
FULL_METRIC_NAMES = [
    "Jaccard", "Dice", "LevenshteinRatio", "Jaro", "JaroWinkler",
    "Cosine", "Overlap", "LCSRatio", "NgramJaccard", "NgramDice",
    "GaussManhattan", "GaussEuclidean", "GaussMinkowski", "GaussChebyshev",
    "LengthRatio", "VocabularyRatio",
    "IR_InstrCountRatio", "IR_LabelCountRatio", "IR_BranchCountRatio",
    "IR_JumpCountRatio", "IR_AssignCountRatio", "IR_CallCountRatio",
    "IR_RetCountRatio", "IR_TempCountRatio", "IR_FunctionCountRatio",
    "IR_BranchDensity_A", "IR_BranchDensity_B", "IR_BranchDensityDiff",
    "NormASTJaccard", "NormASTLCSRatio", "NormASTCosine",
    "CFG_NodeCountRatio", "CFG_EdgeCountRatio", "CFG_CyclomaticRatio",
]

# Final 20-feature vector described in the current report.
# If the loaded model expects 20 inputs and similarity.js returns 34, these are selected.
SELECTED_20_METRICS = [
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

# Fallback for older MLP experiments that stored metric_names but not exclude_metrics.
LEGACY_NN_15_METRICS = [
    "Jaccard",
    "Dice",
    "LevenshteinRatio",
    "Cosine",
    "NgramJaccard",
    "NgramDice",
    "LengthRatio",
    "IR_InstrCountRatio",
    "IR_BranchCountRatio",
    "NormASTJaccard",
    "NormASTLCSRatio",
    "NormASTCosine",
    "CFG_NodeCountRatio",
    "CFG_EdgeCountRatio",
    "CFG_CyclomaticRatio",
]

METRIC_ALIASES = {
    # Older naming used in some scripts.
    "CFGNodeCountRatio": "CFG_NodeCountRatio",
    "CFGEdgeCountRatio": "CFG_EdgeCountRatio",
    "CFGPathSimilarity": "CFG_CyclomaticRatio",
    "NormASTLC Ratio": "NormASTLCSRatio",
    "NormASTLCRatio": "NormASTLCSRatio",
    "NormASTLC": "NormASTLCSRatio",
}

DEFAULT_CLASS_NAMES = {
    1: "Type-I Clone",
    2: "Type-II Clone",
    3: "Type-III Clone",
    4: "Type-IV Clone",
}

COMPARE_MODE_NAMES = {
    1: "type",
    2: "value",
    3: "type-value",
}


def canonical_metric_name(name: str) -> str:
    """Normalize metric names for robust matching across old/new scripts."""
    name = METRIC_ALIASES.get(name, name)
    return re.sub(r"[^a-z0-9]", "", name.lower())


def validate_file(path: str | Path, label: str) -> Path:
    p = Path(path).expanduser().resolve()
    if not p.exists():
        raise FileNotFoundError(f"{label} does not exist: {p}")
    if not p.is_file():
        raise ValueError(f"The {label} path is not a file: {p}")
    return p


def resolve_model_path(model_arg: str | Path | None) -> tuple[str, Path]:
    """Resolve a model alias (RF, XGB, NN) or a custom .joblib path."""
    if model_arg is None or str(model_arg).strip() == "":
        model_key = DEFAULT_MODEL_ALIAS
    else:
        model_key = str(model_arg).strip()

    alias = model_key.upper()
    if alias in MODEL_ALIASES:
        return alias, MODEL_ALIASES[alias].expanduser().resolve()

    custom_path = Path(model_key).expanduser()
    if not custom_path.is_absolute():
        custom_path = (PROJECT_DIR / custom_path).resolve()
    else:
        custom_path = custom_path.resolve()

    return "CUSTOM", custom_path


def run_similarity_js(file_a: Path, file_b: Path, compare_mode: int, timeout: int) -> dict[str, Any]:
    if compare_mode not in COMPARE_MODE_NAMES:
        raise ValueError("compare-mode must be 1=type, 2=value, or 3=type-value.")

    if not SIMILARITY_JS.exists():
        raise FileNotFoundError(f"similarity.js was not found: {SIMILARITY_JS}")

    try:
        result = subprocess.run(
            ["node", str(SIMILARITY_JS), str(file_a), str(file_b), str(compare_mode)],
            cwd=str(PROJECT_DIR),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="ignore",
            timeout=timeout,
        )
    except FileNotFoundError as exc:
        raise RuntimeError("Node.js is not installed or is not available in PATH.") from exc
    except subprocess.TimeoutExpired as exc:
        raise TimeoutError(f"similarity.js exceeded the {timeout}s timeout.") from exc

    if result.returncode != 0:
        stderr = result.stderr.strip() or "(no stderr)"
        stdout = result.stdout.strip()
        raise RuntimeError(
            "Error while running similarity.js.\n"
            f"STDERR:\n{stderr}\n"
            f"STDOUT:\n{stdout}"
        )

    raw_output = result.stdout.strip()
    if not raw_output:
        raise ValueError("similarity.js did not return any output.")

    try:
        data = json.loads(raw_output)
    except json.JSONDecodeError as exc:
        raise ValueError(
            "similarity.js did not return valid JSON.\n"
            f"Received output:\n{raw_output}"
        ) from exc

    if isinstance(data, list):
        vector = data
        return {"vector": vector, "metrics": None, "raw": data}

    if isinstance(data, dict) and "vector" in data:
        return data

    raise ValueError(
        "similarity.js must return a numeric list or an object with the 'vector' key.\n\n"
        f"Received output:\n{json.dumps(data, indent=2, ensure_ascii=False)}"
    )


def as_numeric_vector(data: dict[str, Any]) -> list[float]:
    vector = data.get("vector")
    if not isinstance(vector, list):
        raise ValueError("The result does not contain a list under the 'vector' key.")

    if not all(isinstance(x, (int, float)) for x in vector):
        raise ValueError(f"The returned vector is not fully numeric: {vector}")

    return [float(x) for x in vector]


def load_model_bundle(model_path: str | Path) -> tuple[dict[str, Any], Any, Any, Any]:
    model_file = validate_file(model_path, "model")
    loaded = joblib.load(model_file)

    if isinstance(loaded, dict):
        if "model" not in loaded:
            raise ValueError("The .joblib bundle is a dict, but it does not contain the 'model' key.")
        bundle = loaded
        clf = loaded["model"]
        scaler = loaded.get("scaler")
        class_names = loaded.get("class_names")
    else:
        bundle = {}
        clf = loaded
        scaler = None
        class_names = None

    return bundle, clf, scaler, class_names


def expected_feature_count(bundle: dict[str, Any], clf: Any, scaler: Any) -> int | None:
    for key in ("n_features", "n_features_in", "input_dim"):
        if key in bundle:
            return int(bundle[key])

    for obj in (scaler, clf):
        if obj is not None and hasattr(obj, "n_features_in_"):
            return int(obj.n_features_in_)

    return None


def metric_index_lookup(names: list[str]) -> dict[str, int]:
    lookup: dict[str, int] = {}
    for i, name in enumerate(names):
        lookup[canonical_metric_name(name)] = i
    return lookup


def select_metrics(raw_vector: list[float], raw_names: list[str], selected_names: list[str]) -> tuple[list[float], list[str]]:
    lookup = metric_index_lookup(raw_names)
    selected_vector: list[float] = []
    normalized_selected_names: list[str] = []
    missing: list[str] = []

    for name in selected_names:
        canonical = canonical_metric_name(name)
        if canonical not in lookup:
            missing.append(name)
            continue
        idx = lookup[canonical]
        selected_vector.append(raw_vector[idx])
        normalized_selected_names.append(METRIC_ALIASES.get(name, name))

    if missing:
        raise ValueError(
            "Some metrics could not be selected from the generated vector:\n"
            f"  missing: {missing}\n"
            f"  available: {raw_names}"
        )

    return selected_vector, normalized_selected_names


def active_names_from_exclusions(raw_names: list[str], exclude_metrics: list[str]) -> list[str]:
    excluded = {canonical_metric_name(name) for name in exclude_metrics}
    return [name for name in raw_names if canonical_metric_name(name) not in excluded]


def prepare_feature_vector(
    raw_vector: list[float],
    bundle: dict[str, Any],
    clf: Any,
    scaler: Any,
) -> tuple[np.ndarray, list[str], list[float]]:
    """
    Match the vector returned by similarity.js to the feature count expected by the model.

    The safest case is when raw_vector already has the expected length. If similarity.js returns
    the full 34-feature vector but the model expects 20, the current report's selected 20 metrics
    are applied automatically. Older model metadata is also handled when possible.
    """
    expected = expected_feature_count(bundle, clf, scaler)

    if len(raw_vector) == len(FULL_METRIC_NAMES):
        raw_names = FULL_METRIC_NAMES.copy()
    else:
        bundle_names = bundle.get("metric_names")
        if isinstance(bundle_names, list) and len(bundle_names) == len(raw_vector):
            raw_names = [str(name) for name in bundle_names]
        else:
            raw_names = [f"Feature_{i}" for i in range(len(raw_vector))]

    if expected is None or expected == len(raw_vector):
        return np.array([raw_vector], dtype=float), raw_names, raw_vector

    candidate_keys = (
        "active_metric_names",
        "selected_metric_names",
        "feature_names",
        "input_metric_names",
    )

    for key in candidate_keys:
        selected_names = bundle.get(key)
        if isinstance(selected_names, list) and len(selected_names) == expected:
            selected_vector, selected_names = select_metrics(raw_vector, raw_names, [str(n) for n in selected_names])
            return np.array([selected_vector], dtype=float), selected_names, raw_vector

    exclude_metrics = bundle.get("exclude_metrics")
    if isinstance(exclude_metrics, list):
        selected_names = active_names_from_exclusions(raw_names, [str(n) for n in exclude_metrics])
        if len(selected_names) == expected:
            selected_vector, selected_names = select_metrics(raw_vector, raw_names, selected_names)
            return np.array([selected_vector], dtype=float), selected_names, raw_vector

    if len(raw_vector) == len(FULL_METRIC_NAMES) and expected == len(SELECTED_20_METRICS):
        selected_vector, selected_names = select_metrics(raw_vector, FULL_METRIC_NAMES, SELECTED_20_METRICS)
        return np.array([selected_vector], dtype=float), selected_names, raw_vector

    if len(raw_vector) == len(FULL_METRIC_NAMES) and expected == len(LEGACY_NN_15_METRICS):
        selected_vector, selected_names = select_metrics(raw_vector, FULL_METRIC_NAMES, LEGACY_NN_15_METRICS)
        return np.array([selected_vector], dtype=float), selected_names, raw_vector

    raise ValueError(
        "The generated vector does not match the number of features expected by the model.\n"
        f"  similarity.js returned: {len(raw_vector)} features\n"
        f"  the model expects: {expected} features\n"
        "Recommended fix: save 'selected_metric_names' or 'exclude_metrics' in the .joblib file, "
        "or adjust SELECTED_20_METRICS in predict.py to match the training setup."
    )


def clean_class_name(name: str) -> str:
    replacements = {
        "Type 1 (1)": "Type-I Clone",
        "Type 2 (2)": "Type-II Clone",
        "Type 3 (3)": "Type-III Clone",
        "Type 4 (4)": "Type-IV Clone",
        "Plagiarized (1)": "Type-I Clone",
        "Plagiarized (2)": "Type-II Clone",
        "Plagiarized (3)": "Type-III Clone",
        "Plagiarized (4)": "Type-IV Clone",
    }
    return replacements.get(name, name)


def _int_model_classes(clf: Any) -> list[int] | None:
    """Return fitted model classes as integers when available."""
    classes = getattr(clf, "classes_", None)
    if classes is None:
        return None

    try:
        return [int(c) for c in list(classes)]
    except (TypeError, ValueError):
        return None


def uses_zero_indexed_clone_labels(clf: Any, class_names: Any) -> bool:
    """
    Detect models trained internally with labels 0..3 for clone types I..IV.

    This is especially important for XGBoost models trained with y - 1.
    In that case, raw label 0 means Type-I, raw label 1 means Type-II,
    raw label 2 means Type-III, and raw label 3 means Type-IV.
    """
    classes = _int_model_classes(clf)
    return (
        isinstance(class_names, list)
        and len(class_names) == 4
        and classes is not None
        and sorted(classes) == [0, 1, 2, 3]
    )


def display_label_from_raw(raw_label: int, clf: Any, class_names: Any) -> tuple[int, str]:
    """
    Convert a model raw label into the semantic clone label used by Tacco JS.

    Returns:
      semantic_label: 1..4 for Type-I..Type-IV when possible
      display_name: human-readable class name
    """
    raw_label = int(raw_label)

    if isinstance(class_names, dict):
        for key in (raw_label, str(raw_label)):
            if key in class_names:
                name = clean_class_name(str(class_names[key]))
                # If the dictionary itself is 0-indexed, convert only for clone labels.
                if uses_zero_indexed_clone_labels(clf, list(class_names.values())):
                    return raw_label + 1, name
                return raw_label, name

    if isinstance(class_names, list):
        names = [clean_class_name(str(name)) for name in class_names]

        if uses_zero_indexed_clone_labels(clf, class_names):
            if 0 <= raw_label < len(names):
                return raw_label + 1, names[raw_label]
            return raw_label + 1, f"Unknown zero-indexed class: {raw_label}"

        first = names[0].lower() if names else ""
        has_clean_first = len(names) >= 5 or "clean" in first or "no-clone" in first or "0" in first

        if has_clean_first and 0 <= raw_label < len(names):
            return raw_label, names[raw_label]
        if not has_clean_first and 1 <= raw_label <= len(names):
            return raw_label, names[raw_label - 1]
        if not has_clean_first and 0 <= raw_label < len(names):
            # Last-resort fallback for custom models that use 0-indexed labels
            # but did not expose classes_ correctly.
            return raw_label + 1, names[raw_label]

    return raw_label, DEFAULT_CLASS_NAMES.get(raw_label, f"Unknown class: {raw_label}")


def prediction_label(raw_pred: Any, clf: Any, class_names: Any) -> tuple[int, str]:
    raw_int = int(raw_pred)
    return display_label_from_raw(raw_int, clf, class_names)


def print_vector(feature_names: list[str], vector: np.ndarray) -> None:
    values = vector.tolist()[0]
    print("\nModel input vector:")
    for i, (name, value) in enumerate(zip(feature_names, values), start=1):
        print(f"  {i:02d}. {name:<28} {value:.6f}")


def print_probabilities(clf: Any, X_model: np.ndarray, class_names: Any) -> float | None:
    if not hasattr(clf, "predict_proba"):
        return None

    probs = clf.predict_proba(X_model)[0]
    classes = getattr(clf, "classes_", np.arange(len(probs)))

    confidence = float(np.max(probs))

    print("\nClass probabilities:")
    for raw_class, prob in zip(classes, probs):
        semantic_id, name = display_label_from_raw(int(raw_class), clf, class_names)
        print(f"  {name:<18} prob={prob:.4%}")

    print(f"\nPrediction confidence: {confidence:.4%}")
    print("Note: this confidence is not a probability of plagiarism; it only indicates the classifier confidence for the clone type.")
    return confidence


def originality_verdict(
    pred_int: int,
    pred_name: str,
    confidence: float | None,
    high_confidence: float,
    review_confidence: float,
) -> dict[str, str]:
    """
    Produce a relative originality verdict for the compared pair.

    Important: the current Tacco JS models were trained mainly to separate clone types.
    Without a real No-Clone class, the script cannot prove that a submission is original;
    it can only describe how much clone evidence exists relative to the compared file.
    """
    conf = 0.0 if confidence is None else float(confidence)

    if pred_int == 0:
        if confidence is None or conf >= review_confidence:
            return {
                "status": "Likely original relative to this comparison",
                "level": "low clone evidence",
                "action": "No immediate clone evidence from this pair; still compare against a larger reference set when possible.",
            }
        return {
            "status": "Possibly original, but classifier confidence is low",
            "level": "inconclusive",
            "action": "Review manually or compare against more accepted submissions.",
        }

    if pred_int in (1, 2):
        if confidence is None or conf >= high_confidence:
            return {
                "status": "Not original relative to the compared file",
                "level": "strong clone evidence",
                "action": "Human review strongly recommended. This pair matches a direct textual or lexical clone pattern.",
            }
        return {
            "status": "Suspicious similarity relative to the compared file",
            "level": "moderate clone evidence",
            "action": "Review manually, especially identifiers, formatting changes, and preserved structure.",
        }

    if pred_int == 3:
        if confidence is None or conf >= review_confidence:
            return {
                "status": "Low implementation originality relative to the compared file",
                "level": "modified-clone evidence",
                "action": "Review manually. The pair resembles an adapted or partially modified implementation.",
            }
        return {
            "status": "Inconclusive originality result",
            "level": "weak modified-clone evidence",
            "action": "Do not make a decision from this prediction alone; inspect the code and compare against more submissions.",
        }

    if pred_int == 4:
        if confidence is None or conf >= review_confidence:
            return {
                "status": "Ambiguous originality: semantic-clone evidence detected",
                "level": "semantic similarity / review required",
                "action": "Review manually. Similar behavior may come from copying, a canonical algorithm, or independent convergence.",
            }
        return {
            "status": "Inconclusive originality result",
            "level": "weak semantic-clone evidence",
            "action": "Do not classify as original or non-original without manual review and additional comparisons.",
        }

    return {
        "status": f"Unknown originality status for predicted label {pred_int}",
        "level": "unknown",
        "action": "Check class labels stored in the model bundle.",
    }


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Predicts the clone type between two JavaScript files using Tacco JS.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("file_a", help="First JavaScript file")
    parser.add_argument("file_b", help="Second JavaScript file")
    parser.add_argument(
        "model_alias",
        nargs="?",
        default=None,
        help="Model alias to use: RF=Random Forest, XGB=XGBoost, NN=Neural Network. You may also pass a .joblib path.",
    )
    parser.add_argument(
        "--model",
        dest="model_override",
        default=None,
        help="Optional model alias or custom .joblib path. Overrides the positional model_alias if provided.",
    )
    parser.add_argument("--compare-mode", type=int, default=3, choices=[1, 2, 3], help="1=type, 2=value, 3=type-value")
    parser.add_argument("--timeout", type=int, default=30, help="Timeout for similarity.js in seconds")
    parser.add_argument("--high-confidence", type=float, default=0.85, help="Threshold for strong clone evidence / low originality")
    parser.add_argument("--review-confidence", type=float, default=0.65, help="Minimum threshold for emitting a useful review signal")
    parser.add_argument("--show-vector", action="store_true", help="Print the final vector used by the model")
    parser.add_argument("--json", action="store_true", help="Print a JSON summary at the end")
    return parser


def main() -> int:
    parser = build_arg_parser()
    args = parser.parse_args()

    try:
        file_a = validate_file(args.file_a, "file_a")
        file_b = validate_file(args.file_b, "file_b")

        requested_model = args.model_override if args.model_override is not None else args.model_alias
        model_key, model_path = resolve_model_path(requested_model)
        bundle, clf, scaler, class_names = load_model_bundle(model_path)

        similarity_data = run_similarity_js(
            file_a=file_a,
            file_b=file_b,
            compare_mode=args.compare_mode,
            timeout=args.timeout,
        )
        raw_vector = as_numeric_vector(similarity_data)

        X_model, feature_names, full_raw_vector = prepare_feature_vector(
            raw_vector=raw_vector,
            bundle=bundle,
            clf=clf,
            scaler=scaler,
        )

        if scaler is not None:
            X_for_prediction = scaler.transform(X_model)
        else:
            X_for_prediction = X_model

        raw_pred = clf.predict(X_for_prediction)[0]
        raw_pred_int = int(raw_pred)
        pred_int, pred_name = prediction_label(raw_pred, clf, class_names)

        print("\n" + "=" * 72)
        print("Tacco JS - Similarity Prediction Report")
        print("=" * 72)
        print(f"File A          : {file_a}")
        print(f"File B          : {file_b}")
        print(f"Model selected  : {model_key}")
        print(f"Model path      : {model_path}")
        print(f"Compare mode    : {args.compare_mode} ({COMPARE_MODE_NAMES[args.compare_mode]})")
        print(f"Features raw    : {len(full_raw_vector)}")
        print(f"Model features : {X_model.shape[1]}")

        if args.show_vector:
            print_vector(feature_names, X_model)

        confidence = print_probabilities(clf, X_for_prediction, class_names)

        verdict = originality_verdict(
            pred_int=pred_int,
            pred_name=pred_name,
            confidence=confidence,
            high_confidence=args.high_confidence,
            review_confidence=args.review_confidence,
        )

        print("\nFinal result:")
        print(f"  Prediction           : {pred_name}")
        print(f"  Relative originality : {verdict['status']}")
        print(f"  Evidence level       : {verdict['level']}")
        print(f"  Recommended action   : {verdict['action']}")
        print("  Note                 : this result compares A against B; it does not prove absolute originality or plagiarism.")
        print("=" * 72)

        if args.json:
            summary = {
                "file_a": str(file_a),
                "file_b": str(file_b),
                "model_selected": model_key,
                "model": str(model_path),
                "compare_mode": args.compare_mode,
                "compare_mode_name": COMPARE_MODE_NAMES[args.compare_mode],
                "raw_feature_count": len(full_raw_vector),
                "model_feature_count": int(X_model.shape[1]),
                "prediction_raw_label": raw_pred_int,
                "prediction_semantic_label": pred_int,
                "prediction": pred_name,
                "confidence": confidence,
                "originality_status": verdict["status"],
                "originality_evidence_level": verdict["level"],
                "recommended_action": verdict["action"],
                "feature_names": feature_names,
                "feature_vector": X_model.tolist()[0],
            }
            print("\nJSON summary:")
            print(json.dumps(summary, indent=2, ensure_ascii=False))

        return 0

    except Exception as exc:
        print(f"\n[ERROR] {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
