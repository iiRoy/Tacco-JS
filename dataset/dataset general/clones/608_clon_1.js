/*******************************************************************************
 *
 *  PDE Solver Engine Example (Wave Equation)
 *
 *  A demonstration of the PDE solver, originally by Ben Postlethwaite (2012).
 *  This script showcases the usage of the engine for simulating physical
 *  phenomena like wave propagation or diffusion.
 *  Visit benpostlethwaite.ca for more information.
 *
 ******************************************************************************/

var   engine   =   require (   '../.'   )
    ,   aprint   =   require   (   'printarray'   )


    ;   /* Initialize the core PDE engine instance */
var   field   =   engine   (   {

      dt   :   0.1   /*  Time step for the simulation  */
    ,   gamma   :   0.02   /*  Damping factor or diffusion coefficient  */
    ,   eqn   :   "wave"   //  "wave" for the wave equation, "diffusion" for the heat equation.
                           //  Feel free to change this parameter to explore different physics.

    }   )


;   /*  Define the dimensions for our computational grid  */
var   dims   =   {

      x   :   12   //  Grid width
    ,   y   :   12   //  Grid height

}
;


//  -----------------------------------------------------------------------------
//  The following section configures the simulation environment.
//  -----------------------------------------------------------------------------


/*
 *  This crucial step sets up the spatial resolution of the simulation field.
 *  Whenever 'setResolution' is invoked, the internal field arrays are
 *  re-initialized (new Typed Arrays of the specified dimensions are created),
 *  effectively resetting the simulation grid.
 */
field   .   setResolution   (   dims.x   ,   dims.y   )   ;


/*  Define a source point within the field.  */
var   src   =   {

      x   :   3   //  X-coordinate of the source
    ,   y   :   5   //  Y-coordinate of the source
    ,   mag   :   1   //  Magnitude or intensity of the source
}   ;


/*
 *  It is important to add sources to the field either before the time-stepping
 *  begins or dynamically during the simulation updates. If you initiate
 *  the field updates (i.e., progress time) without any active sources,
 *  the field will lack initial energy and consequently will not evolve.
 *  For instance, the 2D diffusion of a zero field remains zero.
 */
field   .   addSource   (   src.x   ,   src.y   ,   src.mag   )   ;


//  -----------------------------------------------------------------------------
//  Main simulation loop and execution.
//  -----------------------------------------------------------------------------


/*
 *  Initiate and execute the wave equation solver.
 *  The resulting coefficients can be utilized in various creative ways:
 *  -   Visualize them using an HTML5 canvas.
 *  -   Plot them with external tools like Gnuplot.
 *  -   Integrate them into dynamic animations for websites or video games.
 *  -   Explore artistic data representation!
 */
var   steps   =   5   ;   //  Number of simulation steps to perform.
var   tic     =   setInterval   (   function   (   )   {

    //  Update the field for one time step and retrieve the new coefficients.
    var   coeffs   =   field   .   update   (   )   ;


    //  ---   Rendering and Output Section   ---
    //  This is where you would integrate your visualization logic.
    //  For this example, we're just printing to the console.
    //  ----------------------------------------


    aprint   (   coeffs   ,   5   (   dims.x   ,   dims.y   )   )   ;   //  Print the 2D array to console.
    console   .   log   (   )   ;   //  Add an empty line for readability between steps.

    steps   --   ;   //  Decrement the remaining steps.

    //  Check if all steps have been completed.
    if   (   steps   ===   0   )   {

        clearInterval   (   tic   )   ;   //  Stop the interval timer.

    }   //  End of if (steps === 0)

}   ,   1000   )   ;   //  Run every 1000 milliseconds (1 second).