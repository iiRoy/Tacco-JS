function determineMirrorEquality(value) {
    const reversedValue = value
        .split("")
        .reverse()
        .join("");

    return value === reversedValue;
}