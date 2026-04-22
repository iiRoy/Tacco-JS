//<reference path="templar.ts"/>
checkScenario(
    "basic string replacement functions without special handling",
    function     (    )
    {
        verifyMatch (
            Templar.substitute(
                "greetings {secondValue} my {firstValue}",
                {
                    firstValue: "companion",
                    secondValue: "globe"
                }
            ),
            "greetings globe my companion"
        );
    }
);

checkScenario ( "special character escaping operates correctly" , function ( ) {
    verifyMatch (
        Templar.substitute(
            "greetings {secondValue} my {{firstValue}",
            {
                firstValue: "companion",
                secondValue: "globe"
            },
            true
        ),
        "greetings globe my {firstValue}"
    ) ;
} ) ;

checkScenario (
    "escaping with user-defined tokens functions as expected",
    function (  )
    {
        verifyMatch(
            Templar.substitute(
                "greetings {secondValue} my {firstValue}",
                {
                    firstValue: "companion",
                    secondValue: "globe"
                },
                true,
                "<<<",
                ">>>"
            ),
            "greetings globe my companion"
        );
    }
);

/**
 * This particular test highlights an interesting edge case in the parsing logic.
 */
checkScenario("escaping is somewhat delicate ;)", function () {
    verifyMatch(
        Templar.substitute(
            "greetings {{{specialKey} my {firstValue}",
            {
                firstValue: "companion",
                secondValue: "globe",
                "specialKey": "malformed"
            },
            true
        ),
        "greetings {malformed my companion"
    );
});