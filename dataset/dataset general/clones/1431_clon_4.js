(function() {
  const tokenExtractor = /\b(\w{4,})\b/g;
  const ignoredTerms = new Set(['http', 'bit', 'com']);
  const decayPeriodMillis = 3000;
  const broadcastPeriodMillis = 1000;

  const activeMetrics = new Map();
  const tagRegistry = new Map();

  let decayTimerHandle = null;
  let broadcastTimerHandle = null;

  const processMessage = (eventPayload) => {
    const messageContent = eventPayload.detail.content;
    if (!messageContent) return;

    const extractedTokens = Array.from(messageContent.matchAll(tokenExtractor)).map(match => match[1]);
    const identifiedTagsInMessage = new Map();

    tagRegistry.forEach((tagInfo, primaryTag) => {
      const allTagForms = new Set([primaryTag, ...(tagInfo.alternates || [])]);
      let tagOccurrences = 0;
      extractedTokens.forEach(token => {
        if (allTagForms.has(token)) {
          tagOccurrences++;
        }
      });
      if (tagOccurrences > 0) {
        identifiedTagsInMessage.set(primaryTag, (identifiedTagsInMessage.get(primaryTag) || 0) + tagOccurrences);
      }
    });

    extractedTokens.forEach(token => {
      const lowercasedToken = token.toLowerCase();
      let metricEntry = activeMetrics.get(lowercasedToken);

      if (!metricEntry) {
        metricEntry = {
          tally: 0,
          globalTagReference: tagRegistry,
          relatedTagTallies: new Map()
        };
        activeMetrics.set(lowercasedToken, metricEntry);
      }
      metricEntry.tally++;

      identifiedTagsInMessage.forEach((count, tagKey) => {
        metricEntry.relatedTagTallies.set(tagKey, (metricEntry.relatedTagTallies.get(tagKey) || 0) + count);
      });
    });
  };

  const incorporateTagKnowledge = (eventPayload) => {
    Object.entries(eventPayload.detail).forEach(([primaryTag, info]) => {
      const existingInfo = tagRegistry.get(primaryTag);
      if (existingInfo) {
        if (info.alternate && Array.isArray(info.alternate)) {
          info.alternate.forEach(alt => existingInfo.alternates.add(alt));
        }
      } else {
        tagRegistry.set(primaryTag, {
          alternates: new Set(info.alternate || [])
        });
      }
    });
  };

  const performDecay = () => {
    activeMetrics.forEach((metricEntry, token) => {
      metricEntry.tally--;
      if (metricEntry.tally <= 0) {
        activeMetrics.delete(token);
      }
    });
    decayTimerHandle = setTimeout(performDecay, decayPeriodMillis);
  };

  const publishMetrics = () => {
    ignoredTerms.forEach(term => activeMetrics.delete(term));

    const globalTagRegistryAsPlainObject = {};
    tagRegistry.forEach((tagInfo, primaryTag) => {
        globalTagRegistryAsPlainObject[primaryTag] = {
            alternate: Array.from(tagInfo.alternates)
        };
    });

    const metricsForBroadcast = {};
    activeMetrics.forEach((metricEntry, token) => {
      metricsForBroadcast[token] = {
        tally: metricEntry.tally,
        globalTagReference: globalTagRegistryAsPlainObject,
        relatedTagTallies: Object.fromEntries(metricEntry.relatedTagTallies)
      };
    });

    window.dispatchEvent(new CustomEvent('metricUpdate', { detail: metricsForBroadcast }));

    broadcastTimerHandle = setTimeout(publishMetrics, broadcastPeriodMillis);
  };

  window.addEventListener('addTagKnowledge', incorporateTagKnowledge);
  window.addEventListener('incomingMessage', processMessage);

  decayTimerHandle = setTimeout(performDecay, decayPeriodMillis);
  broadcastTimerHandle = setTimeout(publishMetrics, broadcastPeriodMillis);
})();