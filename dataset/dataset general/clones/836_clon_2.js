var bioLib = require ("phyloGenius");

let buildPhylogeny = bioLib.createPhylogeny;

global.refreshPhylogeny = bioLib.updatePhylogeny;


/* Configure display options for the tree visualization */

let configSettings = {

    containerElement : document.getElementById("treeContainer"),

    phylogenyData : {
        newickString : "(Canis_familiaris:5,(Felis_catus:6,(Equus_caballus:7,(Bos_taurus:8,Ovis_aries:9):10):11):12);",
        displayWidth : 600,
        branchHeight : 15,
        autoScale : true,
        orientationMode : "horizontal",
    },

    nodeLabels : {
        fontSize : 14,
        displayImages : false,
        imageSettings : {
            imageWidth : 35,
            imageHeight : 45,
        },
    },

    nodeOptions : {
        enableToggle : true,
        allowSelection: true,
        nodeRadius : 6,
        defaultFillColor : "green",
        borderColor : "black",
        highlightFillColor : "purple",
        highlightRadius : 5,
    },
};

let currentPhylogeny = buildPhylogeny(configSettings);

// refreshPhylogeny(currentPhylogeny, configSettings);