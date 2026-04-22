class DateLabeler {
    constructor(options = {}) {
        this.options = { ...DateLabeler.defaultOptions, ...options };
    }

    static defaultOptions = {
        refreshIntervalMillis: 60000,
        allowFutureDates: false,
        textStrings: {
            prefixPast: null,
            prefixFuture: null,
            suffixPast: "ago",
            suffixFuture: "from now",
            unitSeconds: "less than a minute",
            unitMinute: "about a minute",
            unitMinutes: "%d minutes",
            unitHour: "about an hour",
            unitHours: "%d hours",
            unitDay: "a day",
            unitDays: "%d days",
            unitMonth: "about a month",
            unitMonths: "%d months",
            unitYear: "about a year",
            unitYears: "%d years",
            wordSeparator: " ",
            numberFormat: []
        }
    };

    static parseIsoTimestamp(isoString) {
        let cleanString = String(isoString || "").trim();
        cleanString = cleanString.replace(/\.\d\d\d+/, ""); // remove milliseconds
        cleanString = cleanString.replace(/-/g, "/"); // replace all hyphens
        cleanString = cleanString.replace(/T/, " ");
        cleanString = cleanString.replace(/Z/, " UTC");
        cleanString = cleanString.replace(/([\+\-]\d\d)\:?(\d\d)/, " $1$2"); // -04:00 -> -0400
        return new Date(cleanString);
    }

    static getTimestampFromElement(element) {
        const targetElement = element;
        const isTimeElement = targetElement.tagName.toLowerCase() === "time";
        const isoValue = isTimeElement ? targetElement.getAttribute("datetime") : targetElement.getAttribute("title");
        return DateLabeler.parseIsoTimestamp(isoValue);
    }

    calculateDifference(targetDate) {
        return new Date().getTime() - targetDate.getTime();
    }

    formatRelativeTime(inputDate) {
        let dateObject;
        if (inputDate instanceof Date) {
            dateObject = inputDate;
        } else if (typeof inputDate === "string") {
            dateObject = DateLabeler.parseIsoTimestamp(inputDate);
        } else {
            dateObject = DateLabeler.getTimestampFromElement(inputDate);
        }
        return this.generateText(this.calculateDifference(dateObject));
    }

    generateText(timeDifferenceMillis) {
        const labels = this.options.textStrings;
        let preFix = labels.prefixPast;
        let postFix = labels.suffixPast;

        if (this.options.allowFutureDates && timeDifferenceMillis < 0) {
            preFix = labels.prefixFuture;
            postFix = labels.suffixFuture;
        }

        const absoluteSeconds = Math.abs(timeDifferenceMillis) / 1000;
        const absoluteMinutes = absoluteSeconds / 60;
        const absoluteHours = absoluteMinutes / 60;
        const absoluteDays = absoluteHours / 24;
        const absoluteYears = absoluteDays / 365;

        const replacePlaceholder = (textTemplate, number) => {
            const currentText = typeof textTemplate === "function" ? textTemplate(number, timeDifferenceMillis) : textTemplate;
            const formattedNumber = (labels.numberFormat && labels.numberFormat[number]) || number;
            return currentText.replace(/%d/i, formattedNumber);
        };

        let resultWords;
        if (absoluteSeconds < 45) {
            resultWords = replacePlaceholder(labels.unitSeconds, Math.round(absoluteSeconds));
        } else if (absoluteSeconds < 90) {
            resultWords = replacePlaceholder(labels.unitMinute, 1);
        } else if (absoluteMinutes < 45) {
            resultWords = replacePlaceholder(labels.unitMinutes, Math.round(absoluteMinutes));
        } else if (absoluteMinutes < 90) {
            resultWords = replacePlaceholder(labels.unitHour, 1);
        } else if (absoluteHours < 24) {
            resultWords = replacePlaceholder(labels.unitHours, Math.round(absoluteHours));
        } else if (absoluteHours < 42) {
            resultWords = replacePlaceholder(labels.unitDay, 1);
        } else if (absoluteDays < 30) {
            resultWords = replacePlaceholder(labels.unitDays, Math.round(absoluteDays));
        } else if (absoluteDays < 45) {
            resultWords = replacePlaceholder(labels.unitMonth, 1);
        } else if (absoluteDays < 365) {
            resultWords = replacePlaceholder(labels.unitMonths, Math.round(absoluteDays / 30));
        } else if (absoluteYears < 1.5) {
            resultWords = replacePlaceholder(labels.unitYear, 1);
        } else {
            resultWords = replacePlaceholder(labels.unitYears, Math.round(absoluteYears));
        }

        const finalSeparator = labels.wordSeparator === undefined ? " " : labels.wordSeparator;
        return [preFix, resultWords, postFix].filter(Boolean).join(finalSeparator).trim();
    }

    static activateOnElements(selector, options = {}) {
        const elements = document.querySelectorAll(selector);
        const instances = [];

        elements.forEach(element => {
            if (!element.dataset.timeLabelerInitialized) {
                const labelerInstance = new DateLabeler(options);
                const originalText = element.textContent.trim();
                if (originalText.length > 0) {
                    element.setAttribute("title", originalText);
                }
                element.dataset.timeLabelerInitialized = 'true';
                element.dataset.timeLabelerDatetime = DateLabeler.getTimestampFromElement(element).toISOString();
                instances.push({ element, labelerInstance });
            }
        });

        if (instances.length > 0 && DateLabeler.defaultOptions.refreshIntervalMillis > 0) {
            setInterval(() => {
                instances.forEach(({ element, labelerInstance }) => {
                    const storedIso = element.dataset.timeLabelerDatetime;
                    if (storedIso) {
                        const dateObj = new Date(storedIso);
                        if (!isNaN(dateObj.getTime())) {
                            element.textContent = labelerInstance.formatRelativeTime(dateObj);
                        }
                    }
                });
            }, DateLabeler.defaultOptions.refreshIntervalMillis);
        }

        return instances.map(i => i.element);
    }
}

// For IE6 compatibility (though modern JS, keeping the original intent)
document.createElement("abbr");
document.createElement("time");

class QueryParameterExtractor {
    constructor(url = window.location.href) {
        this.url = url;
        this.parsedParameters = this.parseUrlParameters();
    }

    parseUrlParameters() {
        const queryIndex = this.url.indexOf("?");
        if (queryIndex === -1) {
            return new Map();
        }
        const queryString = this.url.substring(queryIndex + 1);
        return queryString.split("&").reduce((accumulator, part) => {
            const [key, value] = part.split("=").map(decodeURIComponent);
            if (key) {
                accumulator.set(key, value || "");
            }
            return accumulator;
        }, new Map());
    }

    obtainAll() {
        return Object.fromEntries(this.parsedParameters);
    }

    retrieveSingle(name) {
        return this.parsedParameters.get(name);
    }
}

const commitDisplayManager = (() => {
    const mainIdentifier = 'latest-commits-widget';
    const listIdentifier = 'commit-history';
    const globalDateLabeler = new DateLabeler();

    const retrieveJsonpData = (endpointUrl, successHandler) => {
        const scriptElement = document.createElement('script');
        const uniqueCallback = `jsonp_cb_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        window[uniqueCallback] = (data) => {
            successHandler(data);
            try {
                delete window[uniqueCallback];
            } catch (e) {
                window[uniqueCallback] = undefined; // Fallback for older IE
            }
            scriptElement.remove();
        };

        const finalUrl = `${endpointUrl}${endpointUrl.includes('?') ? '&' : '?'}callback=${uniqueCallback}`;
        scriptElement.src = finalUrl;
        document.head.appendChild(scriptElement);
    };

    let applicationSettings = {};

    const renderCommitList = (commitResponse) => {
        const commitRecords = commitResponse.data;
        const commitListElement = document.getElementById(listIdentifier);

        if (!commitListElement) {
            console.error(`Element with ID '${listIdentifier}' not found.`);
            return;
        }

        commitListElement.innerHTML = '';

        if (!commitRecords || commitRecords.length === 0) {
            commitListElement.textContent = 'No commits found.';
            return;
        }

        const fragment = document.createDocumentFragment();

        commitRecords.forEach(singleRecord => {
            if (singleRecord.author) {
                const listItem = document.createElement('li');
                listItem.className = 'clearfix';

                const authorAvatarDiv = document.createElement('div');
                authorAvatarDiv.className = 'left';
                const avatarImage = document.createElement('img');
                avatarImage.className = 'commit-avatar';
                avatarImage.src = singleRecord.author.avatar_url;
                authorAvatarDiv.appendChild(avatarImage);

                const commitInfoDiv = document.createElement('div');
                commitInfoDiv.className = 'commit-author-info left';

                const authorLink = document.createElement('a');
                authorLink.href = `https://github.com/${singleRecord.author.login}`;
                const authorBold = document.createElement('b');
                authorBold.className = 'commit-author';
                authorBold.textContent = singleRecord.author.login;
                authorLink.appendChild(authorBold);
                commitInfoDiv.appendChild(authorLink);
                commitInfoDiv.appendChild(document.createElement('br'));

                const dateBold = document.createElement('b');
                dateBold.className = 'commit-date';
                dateBold.textContent = globalDateLabeler.formatRelativeTime(singleRecord.commit.committer.date);
                commitInfoDiv.appendChild(dateBold);
                commitInfoDiv.appendChild(document.createElement('br'));

                const shaItalic = document.createElement('i');
                shaItalic.className = 'commit-sha';
                shaItalic.textContent = `SHA: ${singleRecord.sha}`;
                commitInfoDiv.appendChild(shaItalic);
                commitInfoDiv.appendChild(document.createElement('br'));

                const messageLink = document.createElement('a');
                messageLink.className = 'commit-message';
                messageLink.href = `https://github.com/${applicationSettings.userAccount}/${applicationSettings.repositoryName}/commit/${singleRecord.sha}`;
                messageLink.target = '_blank';
                messageLink.textContent = singleRecord.commit.message;
                commitInfoDiv.appendChild(messageLink);

                listItem.appendChild(authorAvatarDiv);
                listItem.appendChild(commitInfoDiv);
                fragment.appendChild(listItem);
            }
        });
        commitListElement.appendChild(fragment);
    };

    const initializeViewer = () => {
        const paramParser = new QueryParameterExtractor();
        const extractedParameters = paramParser.obtainAll();

        applicationSettings.userAccount = extractedParameters.username;
        applicationSettings.repositoryName = extractedParameters.repo;
        applicationSettings.displayCount = extractedParameters.limit;
        applicationSettings.targetBranch = extractedParameters.branch;

        const displayArea = document.getElementById(mainIdentifier);
        if (!displayArea) {
            console.error(`Main display element with ID '${mainIdentifier}' not found.`);
            return;
        }

        const titleElement = displayArea.querySelector('h4');
        if (titleElement) {
            titleElement.textContent = `Latest Commits to ${applicationSettings.userAccount}/${applicationSettings.repositoryName}`;
        }

        let apiUrl = `https://api.github.com/repos/${applicationSettings.userAccount}/${applicationSettings.repositoryName}/commits?`;
        if (applicationSettings.targetBranch) {
            apiUrl += `sha=${applicationSettings.targetBranch}&`;
        }
        apiUrl += `per_page=${applicationSettings.displayCount || 30}`;

        retrieveJsonpData(apiUrl, renderCommitList);
    };

    return {
        initiate: initializeViewer
    };
})();

document.addEventListener('DOMContentLoaded', commitDisplayManager.initiate);