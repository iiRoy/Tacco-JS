class FilmVault {
    #accessKey;
    #apiBaseUrl;
    #imageBaseUrl;
    #requestTimeout;

    constructor(key) {
        this.#accessKey = key || "";
        this.#apiBaseUrl = "http://api.themoviedb.org/3/";
        this.#imageBaseUrl = "http://image.tmdb.org/t/p/";
        this.#requestTimeout = 5000;
    }

    #buildQueryParams(configBag) {
        const urlParameters = new URLSearchParams();
        urlParameters.append("api_key", this.#accessKey);

        const currentConfig = configBag || {};
        Object.keys(currentConfig).forEach(key => {
            if (key !== "id" && key !== "body") {
                urlParameters.append(key, currentConfig[key]);
            }
        });
        return `?${urlParameters.toString()}`;
    }

    #ensureHandlers(handlerArray) {
        if (!Array.isArray(handlerArray) || handlerArray.length < 2 || typeof handlerArray[0] !== "function" || typeof handlerArray[1] !== "function") {
            throw new Error("Success and error handlers must be functions!");
        }
    }

    #assertParameters(passedArgs, expectedCount, optionalParams, mandatoryKeys, allowAllOptional = false) {
        if (passedArgs.length !== expectedCount) {
            throw new Error(`Method expects ${expectedCount} arguments, received ${passedArgs.length}!`);
        }

        if (allowAllOptional) {
            return;
        }

        if (expectedCount > 2 && mandatoryKeys && mandatoryKeys.length > 0) {
            const missingKeys = mandatoryKeys.filter(key => !optionalParams.hasOwnProperty(key));
            if (missingKeys.length > 0) {
                throw new Error(`${missingKeys.join(", ")} are required parameters and not found in options!`);
            }
        }
    }

    #constructImageUrl(imageSettings) {
        return this.#imageBaseUrl + imageSettings.size + "/" + imageSettings.file;
    }

    async #performFetch(fetchConfig, resolveHandler, rejectHandler) {
        const { endpoint, httpMethod = "GET", expectedStatus = 200, payload } = fetchConfig;
        const fullUrl = this.#apiBaseUrl + endpoint;

        const controller = new AbortController();
        const timeoutIdentifier = setTimeout(() => controller.abort(), this.#requestTimeout);

        try {
            const requestOptions = {
                method: httpMethod,
                signal: controller.signal,
                headers: {}
            };

            if (httpMethod === "POST") {
                requestOptions.headers["Content-Type"] = "application/json";
                requestOptions.headers["Accept"] = "application/json";
                requestOptions.body = JSON.stringify(payload);
            }

            const response = await fetch(fullUrl, requestOptions);
            clearTimeout(timeoutIdentifier);

            if (response.ok && response.status === expectedStatus) {
                const responseText = await response.text();
                resolveHandler(responseText);
            } else {
                const responseText = await response.text();
                rejectHandler(responseText);
            }
        } catch (requestError) {
            clearTimeout(timeoutIdentifier);
            if (requestError.name === 'AbortError') {
                rejectHandler('{"status_code":408,"status_message":"Request timed out"}');
            } else {
                rejectHandler(`{"status_code":500,"status_message":"Network error: ${requestError.message}"}`);
            }
        }
    }

    retrieveConfiguration(onSuccess, onError) {
        this.#assertParameters(arguments, 2);
        this.#ensureHandlers([onSuccess, onError]);
        this.#performFetch(
            { endpoint: "configuration" + this.#buildQueryParams({}) },
            onSuccess,
            onError
        );
    }

    getAccountInfo(params, onSuccess, onError) {
        this.#assertParameters(arguments, 3, params, ["session_id"]);
        this.#ensureHandlers([onSuccess, onError]);
        this.#performFetch(
            { endpoint: "account" + this.#buildQueryParams(params) },
            onSuccess,
            onError
        );
    }

    listAccountLists(params, onSuccess, onError) {
        this.#assertParameters(arguments, 3, params, ["session_id", "id"]);
        this.#ensureHandlers([onSuccess, onError]);
        this.#performFetch(
            { endpoint: `account/${params.id}/lists` + this.#buildQueryParams(params) },
            onSuccess,
            onError
        );
    }

    getFavoriteFilms(params, onSuccess, onError) {
        this.#assertParameters(arguments, 3, params, ["session_id", "id"]);
        this.#ensureHandlers([onSuccess, onError]);
        this.#performFetch(
            { endpoint: `account/${params.id}/favorite_movies` + this.#buildQueryParams(params) },
            onSuccess,
            onError
        );
    }

    markAsFavorite(params, onSuccess, onError) {
        this.#assertParameters(arguments, 3, params, ["session_id", "id", "movie_id", "favorite"]);
        this.#ensureHandlers([onSuccess, onError]);
        const dataBody = { "movie_id": params.movie_id, "favorite": params.favorite };
        this.#performFetch(
            {
                endpoint: `account/${params.id}/favorite` + this.#buildQueryParams(params),
                expectedStatus: 201,
                httpMethod: "POST",
                payload: dataBody
            },
            onSuccess,
            onError
        );
    }

    getRatedFilms(params, onSuccess, onError) {
        this.#assertParameters(arguments, 3, params, ["session_id", "id"]);
        this.#ensureHandlers([onSuccess, onError]);
        this.#performFetch(
            { endpoint: `account/${params.id}/rated_movies` + this.#buildQueryParams(params) },
            onSuccess,
            onError
        );
    }

    getFilmWatchlist(params, onSuccess, onError) {
        this.#assertParameters(arguments, 3, params, ["session_id", "id"]);
        this.#ensureHandlers([onSuccess, onError]);
        this.#performFetch(
            { endpoint: `account/${params.id}/movie_watchlist` + this.#buildQueryParams(params) },
            onSuccess,
            onError
        );
    }

    addToFilmWatchlist(params, onSuccess, onError) {
        this.#assertParameters(arguments, 3, params, ["session_id", "id", "movie_id", "movie_watchlist"]);
        this.#ensureHandlers([onSuccess, onError]);
        const dataBody = { "movie_id": params.movie_id, "movie_watchlist": params.movie_watchlist };
        this.#performFetch(
            {
                endpoint: `account/${params.id}/movie_watchlist` + this.#buildQueryParams(params),
                httpMethod: "POST",
                expectedStatus: 201,
                payload: dataBody
            },
            onSuccess,
            onError
        );
    }

    createAuthToken(onSuccess, onError) {
        this.#assertParameters(arguments, 2);
        this.#ensureHandlers([onSuccess, onError]);
        this.#performFetch(
            { endpoint: "authentication/token/new" + this.#buildQueryParams({}) },
            onSuccess,
            onError
        );
    }

    requestUserAuthorization(authorizationDetails) {
        window.open(`https://www.themoviedb.org/authenticate/${authorizationDetails.requestIdentifier}?redirect_to=${authorizationDetails.returnToUrl}`);
    }

    validateUserCredentials(params, onSuccess, onError) {
        this.#assertParameters(arguments, 3, params, ["request_token", "username", "password"]);
        this.#ensureHandlers([onSuccess, onError]);
        this.#performFetch(
            { endpoint: "authentication/token/validate_with_login" + this.#buildQueryParams(params) },
            onSuccess,
            onError
        );
    }

    createSession(params, onSuccess, onError) {
        this.#assertParameters(arguments, 3, params, ["request_token"]);
        this.#ensureHandlers([onSuccess, onError]);
        this.#performFetch(
            { endpoint: "authentication/session/new" + this.#buildQueryParams(params) },
            onSuccess,
            onError
        );
    }

    createGuestSession(onSuccess, onError) {
        this.#assertParameters(arguments, 2);
        this.#ensureHandlers([onSuccess, onError]);
        this.#performFetch(
            { endpoint: "authentication/guest_session/new" + this.#buildQueryParams({}) },
            onSuccess,
            onError
        );
    }

    getCertificationsList(onSuccess, onError) {
        this.#assertParameters(arguments, 2);
        this.#ensureHandlers([onSuccess, onError]);
        this.#performFetch(
            { endpoint: "certification/movie/list" + this.#buildQueryParams({}) },
            onSuccess,
            onError
        );
    }

    getMovieRevisionLog(params, onSuccess, onError) {
        this.#assertParameters(arguments, 3, "", "", true);
        this.#ensureHandlers([onSuccess, onError]);
        this.#performFetch(
            { endpoint: "movie/changes" + this.#buildQueryParams(params) },
            onSuccess,
            onError
        );
    }

    getPersonRevisionLog(params, onSuccess, onError) {
        this.#assertParameters(arguments, 3, "", "", true);
        this.#ensureHandlers([onSuccess, onError]);
        this.#performFetch(
            { endpoint: "person/changes" + this.#buildQueryParams(params) },
            onSuccess,
            onError
        );
    }

    getFilmCollection(params, onSuccess, onError) {
        this.#assertParameters(arguments, 3, params, ["id"]);
        this.#ensureHandlers([onSuccess, onError]);
        this.#performFetch(
            { endpoint: `collection/${params.id}` + this.#buildQueryParams(params) },
            onSuccess,
            onError
        );
    }

    getCollectionArtwork(params, onSuccess, onError) {
        this.#assertParameters(arguments, 3, params, ["id"]);
        this.#ensureHandlers([onSuccess, onError]);
        this.#performFetch(
            { endpoint: `collection/${params.id}/images` + this.#buildQueryParams(params) },
            onSuccess,
            onError
        );
    }

    getProductionCompany(params, onSuccess, onError) {
        this.#assertParameters(arguments, 3, params, ["id"]);
        this.#ensureHandlers([onSuccess, onError]);
        this.#performFetch(
            { endpoint: `company/${params.id}` + this.#buildQueryParams(params) },
            onSuccess,
            onError
        );
    }

    getCompanyFilmography(params, onSuccess, onError) {
        this.#assertParameters(arguments, 3, params, ["id"]);
        this.#ensureHandlers([onSuccess, onError]);
        this.#performFetch(
            { endpoint: `company/${params.id}/movies` + this.#buildQueryParams(params) },
            onSuccess,
            onError
        );
    }

    getCastCrewCredit(params, onSuccess, onError) {
        this.#assertParameters(arguments, 3, params, ["id"]);
        this.#ensureHandlers([onSuccess, onError]);
        this.#performFetch(
            { endpoint: `credit/${params.id}` + this.#buildQueryParams(params) },
            onSuccess,
            onError
        );
    }

    findMovies(params, onSuccess, onError) {
        this.#assertParameters(arguments, 3, "", "", true);
        this.#ensureHandlers([onSuccess, onError]);
        this.#performFetch(
            { endpoint: "discover/movie" + this.#buildQueryParams(params) },
            onSuccess,
            onError
        );
    }

    findTvSeries(params, onSuccess, onError) {
        this.#assertParameters(arguments, 3, "", "", true);
        this.#ensureHandlers([onSuccess, onError]);
        this.#performFetch(
            { endpoint: "discover/tv" + this.#buildQueryParams(params) },
            onSuccess,
            onError
        );
    }

    lookupById(params, onSuccess, onError) {
        this.#assertParameters(arguments, 3, params, ["id", "external_source"]);
        this.#ensureHandlers([onSuccess, onError]);
        this.#performFetch(
            { endpoint: `find/${params.id}` + this.#buildQueryParams(params) },
            onSuccess,
            onError
        );
    }
}