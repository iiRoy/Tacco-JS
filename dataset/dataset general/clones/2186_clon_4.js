let testOutcomeLog = [];
let passCounter = 0;
let failCounter = 0;

function evaluateEquality(actualValue, expectedValue, assertionDescription) {
    if (actualValue === expectedValue) {
        testOutcomeLog.push(`SUCCESS: ${assertionDescription}`);
        passCounter++;
    } else {
        testOutcomeLog.push(`FAILURE: ${assertionDescription}. Expected: "${expectedValue}", Got: "${actualValue}"`);
        failCounter++;
    }
}

function processUserAgentData(inputSignature) {
    const findingsContainer = {
        platformIdentifier: "unknown",
        platformRevision: "unknown",
        browserIdentifier: "unknown",
        browserRevision: "0",
        deviceType: "unknown",
        isMobileFlag: false,
        isTabletFlag: false,
        isDesktopFlag: false,
        rawInput: {
            agentString: inputSignature
        }
    };

    const extractRevision = (pattern, defaultRevision = "0") => {
        const matchResult = inputSignature.match(pattern);
        return matchResult && matchResult[1] ? matchResult[1] : defaultRevision;
    };

    if (inputSignature.includes("Windows")) {
        findingsContainer.platformIdentifier = "windows";
        if (inputSignature.includes("Windows NT 6.3")) findingsContainer.platformRevision = "windows-8-1";
        else if (inputSignature.includes("Windows NT 6.2")) findingsContainer.platformRevision = "windows-8";
        else if (inputSignature.includes("Windows NT 6.1")) findingsContainer.platformRevision = "windows-7";
        else if (inputSignature.includes("Windows NT 6.0")) findingsContainer.platformRevision = "windows-vista";
        else if (inputSignature.includes("Windows NT 5.2")) findingsContainer.platformRevision = "windows-server-2003";
        else if (inputSignature.includes("Windows NT 5.1") || inputSignature.includes("Windows XP")) findingsContainer.platformRevision = "windows-xp";
        else if (inputSignature.includes("Windows NT 5.0") || inputSignature.includes("Windows 2000")) findingsContainer.platformRevision = "windows-2000";
        else if (inputSignature.includes("Win 9x 4.90") || inputSignature.includes("Windows ME")) findingsContainer.platformRevision = "windows-me";
        else if (inputSignature.includes("Windows 98") || inputSignature.includes("Win98")) findingsContainer.platformRevision = "windows-98";
        else if (inputSignature.includes("Windows 95") || inputSignature.includes("Win95") || inputSignature.includes("Windows_95")) findingsContainer.platformRevision = "windows-95";
        else if (inputSignature.includes("Win16")) findingsContainer.platformRevision = "windows-3-11";
        else if (inputSignature.includes("Windows CE")) findingsContainer.platformRevision = "windows-ce";
        else if (inputSignature.includes("Windows NT 4.0") || inputSignature.includes("WinNT4.0") || inputSignature.includes("WinNT")) findingsContainer.platformRevision = "windows-nt-4-0";
    } else if (inputSignature.includes("Macintosh")) {
        findingsContainer.platformIdentifier = "mac";
    } else if (inputSignature.includes("Linux")) {
        findingsContainer.platformIdentifier = "linux";
    } else if (inputSignature.includes("iPad") || inputSignature.includes("iPhone") || inputSignature.includes("iPod")) {
        findingsContainer.platformIdentifier = "ios";
    } else if (inputSignature.includes("Windows Phone")) {
        findingsContainer.platformIdentifier = "windows-phone";
    } else if (inputSignature.includes("PlayStation 4")) {
        findingsContainer.platformIdentifier = "ps4";
    } else if (inputSignature.includes("Playstation Vita")) {
        findingsContainer.platformIdentifier = "vita";
    }

    if (inputSignature.includes("Chrome") && !inputSignature.includes("CriOS")) {
        findingsContainer.browserIdentifier = "chrome";
        findingsContainer.browserRevision = extractRevision(/Chrome\/([\d.]+)/);
    } else if (inputSignature.includes("CriOS")) {
        findingsContainer.browserIdentifier = "chrome";
        findingsContainer.browserRevision = "0";
    } else if (inputSignature.includes("Firefox")) {
        findingsContainer.browserIdentifier = "firefox";
        findingsContainer.browserRevision = extractRevision(/Firefox\/([\d.]+)/);
    } else if (inputSignature.includes("Safari") && !inputSignature.includes("Chrome") && !inputSignature.includes("CriOS")) {
        findingsContainer.browserIdentifier = "safari";
        findingsContainer.browserRevision = extractRevision(/Version\/([\d.]+)/);
    } else if (inputSignature.includes("MSIE")) {
        findingsContainer.browserIdentifier = "ie";
        findingsContainer.browserRevision = extractRevision(/MSIE ([\d.]+)/);
    } else if (inputSignature.includes("Trident/") && inputSignature.includes("rv:11.0")) {
        findingsContainer.browserIdentifier = "ie";
        findingsContainer.browserRevision = extractRevision(/rv:([\d.]+)/);
    } else if (inputSignature.includes("PlayStation 4")) {
        findingsContainer.browserIdentifier = "ps4";
        findingsContainer.browserRevision = "0";
    } else if (inputSignature.includes("Playstation Vita")) {
        findingsContainer.browserIdentifier = "vita";
        findingsContainer.browserRevision = "0";
    }

    if (inputSignature.includes("iPad")) {
        findingsContainer.deviceType = "ipad";
        findingsContainer.isTabletFlag = true;
        findingsContainer.isMobileFlag = true;
    } else if (inputSignature.includes("Windows Phone")) {
        findingsContainer.deviceType = "windows-phone";
        findingsContainer.isMobileFlag = true;
    } else if (inputSignature.includes("PlayStation 4")) {
        findingsContainer.deviceType = "ps4";
    } else if (inputSignature.includes("Playstation Vita")) {
        findingsContainer.deviceType = "vita";
        findingsContainer.isMobileFlag = true;
    }

    if (!findingsContainer.isMobileFlag && !findingsContainer.isTabletFlag) {
        findingsContainer.isDesktopFlag = true;
    }

    return {
        operatingSystem: findingsContainer.platformIdentifier,
        operatingSystemVersion: findingsContainer.platformRevision,
        browserType: findingsContainer.browserIdentifier,
        browserVersion: findingsContainer.browserRevision,
        deviceCategory: findingsContainer.deviceType,
        isMobile: () => findingsContainer.isMobileFlag,
        isTablet: () => findingsContainer.isTabletFlag,
        isDesktop: () => findingsContainer.isDesktopFlag,
        rawInfo: {
            agentString: findingsContainer.rawInput.agentString
        }
    };
}

const operationalTestCases = [
    {
        agent: "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
        expectedResult: {
            os: "windows", os_version: "windows-8-1", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1664.3 Safari/537.36",
        expectedResult: {
            os: "mac", os_version: "unknown", browser: "chrome", browser_version: "32.0.1664.3", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.21 (KHTML, like Gecko) Chrome/19.0.1042.0 Safari/535.21",
        expectedResult: {
            os: "linux", os_version: "unknown", browser: "chrome", browser_version: "19.0.1042.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (Windows NT 5.1; rv:31.0) Gecko/20100101 Firefox/31.0",
        expectedResult: {
            os: "windows", os_version: "windows-xp", browser: "firefox", browser_version: "31.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:25.0) Gecko/20100101 Firefox/25.0",
        expectedResult: {
            os: "mac", os_version: "unknown", browser: "firefox", browser_version: "25.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:24.0) Gecko/20100101 Firefox/24.0",
        expectedResult: {
            os: "linux", os_version: "unknown", browser: "firefox", browser_version: "24.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25",
        expectedResult: {
            os: "ios", os_version: "unknown", browser: "safari", browser_version: "6.0", device: "ipad",
            mobile: true, tablet: true, desktop: false
        }
    },
    {
        agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2",
        expectedResult: {
            os: "mac", os_version: "unknown", browser: "safari", browser_version: "5.1.7", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (X11; U; Linux x86_64; en-us) AppleWebKit/531.2+ (KHTML, like Gecko) Version/5.0 Safari/531.2+",
        expectedResult: {
            os: "linux", os_version: "unknown", browser: "safari", browser_version: "5.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (iPad; CPU OS 8_0_2 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) CriOS/38.0.2125.59 Mobile/12A405 Safari/600.1.4 (000767)",
        expectedResult: {
            os: "ios", os_version: "unknown", browser: "chrome", browser_version: "0", device: "ipad",
            mobile: true, tablet: true, desktop: false
        }
    },
    {
        agent: "Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0)",
        expectedResult: {
            os: "windows-phone", os_version: "unknown", browser: "ie", browser_version: "9.0", device: "windows-phone",
            mobile: true, tablet: false, desktop: false
        }
    },
    {
        agent: "Mozilla/5.0 (PlayStation 4 1.52) AppleWebKit/536.26 (KHTML, like Gecko)",
        expectedResult: {
            os: "ps4", os_version: "unknown", browser: "ps4", browser_version: "0", device: "ps4",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (Playstation Vita 1.61) AppleWebKit/531.22.8 (KHTML, like Gecko) Silk/3.2",
        expectedResult: {
            os: "vita", os_version: "unknown", browser: "vita", browser_version: "0", device: "vita",
            mobile: true, tablet: false, desktop: false
        }
    },
    {
        agent: "Mozilla/5.0 (Win16; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
        expectedResult: {
            os: "windows", os_version: "windows-3-11", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (Windows 95; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
        expectedResult: {
            os: "windows", os_version: "windows-95", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (Win95; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
        expectedResult: {
            os: "windows", os_version: "windows-95", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (Windows_95; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
        expectedResult: {
            os: "windows", os_version: "windows-95", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (Win 9x 4.90; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
        expectedResult: {
            os: "windows", os_version: "windows-me", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (Windows ME; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
        expectedResult: {
            os: "windows", os_version: "windows-me", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (Windows 98; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
        expectedResult: {
            os: "windows", os_version: "windows-98", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (Win98; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
        expectedResult: {
            os: "windows", os_version: "windows-98", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (Windows CE; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
        expectedResult: {
            os: "windows", os_version: "windows-ce", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (Windows NT 5.0; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
        expectedResult: {
            os: "windows", os_version: "windows-2000", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (Windows 2000; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
        expectedResult: {
            os: "windows", os_version: "windows-2000", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (Windows NT 5.1; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
        expectedResult: {
            os: "windows", os_version: "windows-xp", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (Windows XP; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
        expectedResult: {
            os: "windows", os_version: "windows-xp", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (Windows NT 5.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
        expectedResult: {
            os: "windows", os_version: "windows-server-2003", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (Windows NT 6.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
        expectedResult: {
            os: "windows", os_version: "windows-vista", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
        expectedResult: {
            os: "windows", os_version: "windows-7", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (Windows 7; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
        expectedResult: {
            os: "windows", os_version: "windows-7", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
        expectedResult: {
            os: "windows", os_version: "windows-8-1", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (Windows 8.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
        expectedResult: {
            os: "windows", os_version: "windows-8-1", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
        expectedResult: {
            os: "windows", os_version: "windows-8", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (Windows 8; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
        expectedResult: {
            os: "windows", os_version: "windows-8", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (Windows NT 4.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
        expectedResult: {
            os: "windows", os_version: "windows-nt-4-0", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (WinNT4.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
        expectedResult: {
            os: "windows", os_version: "windows-nt-4-0", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (WinNT; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
        expectedResult: {
            os: "windows", os_version: "windows-nt-4-0", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (WinNT; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
        expectedResult: {
            os: "windows", os_version: "windows-nt-4-0", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 4.0)",
        expectedResult: {
            os: "windows", os_version: "windows-nt-4-0", browser: "ie", browser_version: "6.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/4.0 (compatible; MSIE 6.0b; Windows NT 4.0)",
        expectedResult: {
            os: "windows", os_version: "windows-nt-4-0", browser: "ie", browser_version: "6.0b", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 4.0)",
        expectedResult: {
            os: "windows", os_version: "windows-nt-4-0", browser: "ie", browser_version: "7.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/4.0 (compatible; MSIE 10.0; Windows NT 4.0)",
        expectedResult: {
            os: "windows", os_version: "windows-nt-4-0", browser: "ie", browser_version: "10.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/4.0 (compatible; MSIE 11; Windows NT 4.0)",
        expectedResult: {
            os: "windows", os_version: "windows-nt-4-0", browser: "ie", browser_version: "11", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (Windows NT 6.3; Trident/7.0; .NET4.0E; .NET4.0C; rv:11.0) like Gecko",
        expectedResult: {
            os: "windows", os_version: "windows-8-1", browser: "ie", browser_version: "11.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    },
    {
        agent: "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; InfoPath.3; rv:11.0) like Gecko",
        expectedResult: {
            os: "windows", os_version: "windows-7", browser: "ie", browser_version: "11.0", device: "unknown",
            mobile: false, tablet: false, desktop: true
        }
    }
];

function runAllChecks(testCases) {
    const emptyAgentResult = processUserAgentData("");
    evaluateEquality(emptyAgentResult.rawInfo.agentString, "", "Initial check: Empty user agent string raw value");
    
    const dummyAgentResult = processUserAgentData("dummy");
    evaluateEquality(dummyAgentResult.rawInfo.agentString, "dummy", "Initial check: Dummy user agent string raw value");

    testOutcomeLog.push("\n--- Detailed User Agent Test Cases ---");

    testCases.forEach((currentCase, idx) => {
        const processedInfo = processUserAgentData(currentCase.agent);
        testOutcomeLog.push(`\nTest Case ${idx + 1} for: "${currentCase.agent}"`);

        evaluateEquality(processedInfo.operatingSystem, currentCase.expectedResult.os, `OS detection`);
        evaluateEquality(processedInfo.operatingSystemVersion, currentCase.expectedResult.os_version, `OS version detection`);
        evaluateEquality(processedInfo.browserType, currentCase.expectedResult.browser, `Browser detection`);
        evaluateEquality(processedInfo.browserVersion, currentCase.expectedResult.browser_version, `Browser version detection`);
        evaluateEquality(processedInfo.deviceCategory, currentCase.expectedResult.device, `Device detection`);
        evaluateEquality(processedInfo.isMobile(), currentCase.expectedResult.mobile, `Mobile status`);
        evaluateEquality(processedInfo.isTablet(), currentCase.expectedResult.tablet, `Tablet status`);
        evaluateEquality(processedInfo.isDesktop(), currentCase.expectedResult.desktop, `Desktop status`);
    });

    testOutcomeLog.push("\n--- Test Summary ---");
    testOutcomeLog.push(`Total assertions: ${passCounter + failCounter}`);
    testOutcomeLog.push(`Assertions passed: ${passCounter}`);
    testOutcomeLog.push(`Assertions failed: ${failCounter}`);
}

runAllChecks(operationalTestCases);