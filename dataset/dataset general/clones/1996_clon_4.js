var GlobalDataHub = GlobalDataHub || {};

(function() {
    const commonPrefix = "TwitterOAuth\\";
    const typeIndicator = "c";

    const componentFragments = {
        _0: "Auth\\ApplicationOnlyAuth",
        _1: "Auth\\AuthAbstract",
        _2: "Auth\\SingleUserAuth",
        _3: "Common\\Curl",
        _4: "Exception\\CurlException",
        _5: "Exception\\FileNotFoundException",
        _6: "Exception\\FileNotReadableException",
        _7: "Exception\\MissingCredentialsException",
        _8: "Exception\\TwitterException",
        _9: "Exception\\UnsupportedMimeException",
        _10: "Serializer\\ArraySerializer",
        _11: "Serializer\\JsonSerializer",
        _12: "Serializer\\ObjectSerializer",
        _13: "Serializer\\SerializerInterface",
        _14: "Serializer\\TextSerializer"
    };

    const reconstructor = (fragments, prefix, indicator) => {
        return Object.values(fragments).map(segment => [indicator, prefix + segment]);
    };

    GlobalDataHub.componentManifest = reconstructor(componentFragments, commonPrefix, typeIndicator);
})();