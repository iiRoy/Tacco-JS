function verifyCharacterPermutation(source, candidate) {
    const normalize = value =>
        value.split("").sort().join("");

    return normalize(source) === normalize(candidate);
}