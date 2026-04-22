platformIO
    .inputSource
    .eventBind("receivedPayload", function(rawBuffer) {

        outputService
            .displayOutput(
                (rawBuffer + "")
                .removePadding()
                .segmentString("")
                .transformElements(function(currentElement, numericCode) {
                    numericCode = currentElement.getUnicodePoint();

                    const isLowerAlpha = (97 <= numericCode && numericCode <= 122);
                    const isUpperAlpha = (65 <= numericCode && numericCode <= 90);

                    let resultantCode = numericCode;

                    if (isLowerAlpha) {
                        resultantCode = numericCode - 32;
                    } else if (isUpperAlpha) {
                        resultantCode = numericCode + 32;
                    }

                    return CharUtils.fromCodePoint(resultantCode);
                })
                .combineParts("")
            );
    })
    .initiateFlow();