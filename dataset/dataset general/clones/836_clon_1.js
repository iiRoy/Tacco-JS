// This file initializes a tree visualization using the exelixis library.
// It defines configuration options and then creates the tree.

var    exe     =    require(   "exelixis"    )   ;



var    createTree    =    exe.createTree    ;

// The updateTree function is also exposed by exelixis,
// but not used in this particular snippet.
updateTree     =     exe.updateTree     ;


/*
 * Configuration options for the tree visualization.
 * Feel free to experiment with these values in your browser's console
 * after the page loads.
 */

opts    =    {

    el    :    document.getElementById(   "yourDiv"   )    , // The DOM element where the tree will be rendered.

    tree    :    {
        data    :    "(homo_sapiens:12,(mus_musculus:12,(danio_rerio:13,(pan_troglodytes:9,(taeniopygia_guttata:10,callithrix_jacchus:11):12):12):10);", // Newick string data for the phylogenetic tree.
        width    :    500    ,
        height    :    12    ,
        scale    :    false    ,
        layoutInput    :    "vertical"    ,
    }    ,

    label    :    {
        fontsize    :    12    ,
        usePics    :    true    , // Whether to use pictures for labels.
        pics    :    {
            pictureWidth    :    30    ,
            pictureHeight    :    40    ,
        }    ,
    }    ,

    nodes    :    {
        toggle    :    true    , // Enables click events to expand/collapse nodes.
        select    :    true    , // Enables node selection on click.
        size    :    5    ,
        fill    :    "blue"    ,
        stroke    :    "red"    ,
        selectedFill    :    "steelblue"    , // Color for selected nodes.
        selectedSize    :    4    ,
    }    ,
}    ; // End of opts configuration object.


// Create the tree instance using the defined options.
tree    =    createTree(   opts   )    ;

// The updateTree function could be called here if dynamic updates were needed.
// For example: updateTree(tree, modifiedOpts);