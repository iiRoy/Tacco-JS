function resolveMultiplicativeExpansion(value) {
    if (value < 2) {
        return 1;
    }

    return value * resolveMultiplicativeExpansion(value - 1);
}