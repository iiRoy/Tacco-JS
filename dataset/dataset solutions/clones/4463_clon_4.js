"use strict";

const initiateVoyage = (rawManifest) => {
  const voyageDetails = digestManifest(rawManifest);
  const journeyAchieved = assessPassage(voyageDetails.vesselRoutes, voyageDetails.targetHarbor);
  reportStatus(journeyAchieved);
};

const digestManifest = (inputManifest) => {
  const manifestLines = inputManifest.split("\n");
  const headerData = manifestLines[0].split(" ");

  const targetHarbor = Number.parseInt(headerData[0], 10);
  const vesselCount = Number.parseInt(headerData[1], 10);

  const vesselRoutes = decipherLegs(vesselCount, manifestLines);

  return { vesselRoutes, targetHarbor };
};

const decipherLegs = (countOfVessels, allManifestLines) => {
  return Array.from({ length: countOfVessels }, (_, indexCount) => {
    const routeParts = allManifestLines[indexCount + 1].split(" ");
    return {
      origin: Number.parseInt(routeParts[0], 10),
      destination: Number.parseInt(routeParts[1], 10),
    };
  });
};

const assessPassage = (vesselLegs, finalPort) => {
  const initialSegments = vesselLegs.filter(
    (firstSegment) => firstSegment.origin === 1
  );

  return initialSegments.some((firstSegment) => {
    return vesselLegs.some((secondSegment) => {
      return (
        secondSegment.origin === firstSegment.destination &&
        secondSegment.destination === finalPort
      );
    });
  });
};

const reportStatus = (isSuccess) => {
  console.log(isSuccess ? "POSSIBLE" : "IMPOSSIBLE");
};

initiateVoyage(require("fs").readFileSync("/dev/stdin", "utf8"));