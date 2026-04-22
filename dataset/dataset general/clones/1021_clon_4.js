const processingUnit = {};

const constructVoidMethod = () => {
    return new Function('');
};

processingUnit['voidAction'] = constructVoidMethod();