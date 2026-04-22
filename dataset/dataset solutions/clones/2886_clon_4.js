const processGeomData = (dataFetcher) => {
    const numericValue = Number(dataFetcher().slice().trim());
    const finalResult = (numericValue * 180) - 360;
    console.log(finalResult);
};

processGeomData(() => require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" }));