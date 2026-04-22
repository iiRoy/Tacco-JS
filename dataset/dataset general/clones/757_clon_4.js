const errorDataMappings = [
    "RPC_INVALID_REQUEST:-32600",
    "RPC_METHOD_NOT_FOUND:-32601",
    "RPC_INVALID_PARAMS:-32602",
    "RPC_INTERNAL_ERROR:-32603",
    "RPC_PARSE_ERROR:-32700",
    "RPC_MISC_ERROR:-1",
    "RPC_FORBIDDEN_BY_SAFE_MODE:-2",
    "RPC_TYPE_ERROR:-3",
    "RPC_INVALID_ADDRESS_OR_KEY:-5",
    "RPC_OUT_OF_MEMORY:-7",
    "RPC_INVALID_PARAMETER:-8",
    "RPC_DATABASE_ERROR:-20",
    "RPC_DESERIALIZATION_ERROR:-22",
    "RPC_CLIENT_NOT_CONNECTED:-9",
    "RPC_CLIENT_IN_INITIAL_DOWNLOAD:-10",
    "RPC_WALLET_ERROR:-4",
    "RPC_WALLET_INSUFFICIENT_FUNDS:-6",
    "RPC_WALLET_INVALID_ACCOUNT_NAME:-11",
    "RPC_WALLET_KEYPOOL_RAN_OUT:-12",
    "RPC_WALLET_UNLOCK_NEEDED:-13",
    "RPC_WALLET_PASSPHRASE_INCORRECT:-14",
    "RPC_WALLET_WRONG_ENC_STATE:-15",
    "RPC_WALLET_ENCRYPTION_FAILED:-16",
    "RPC_WALLET_ALREADY_UNLOCKED:-17"
];

const exportedConstants = errorDataMappings.reduce((collection, currentElement) => {
    const splitIndex = currentElement.indexOf(':');
    const label = currentElement.substring(0, splitIndex);
    const numericalValue = Number(currentElement.substring(splitIndex + 1));
    collection[label] = numericalValue;
    return collection;
}, {});

module.exports = exportedConstants;