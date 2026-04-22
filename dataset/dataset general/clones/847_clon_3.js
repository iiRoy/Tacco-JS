// All intellectual property rights reserved by the original creator.

// This visualization draws inspiration from various computational art projects
// and theoretical physics literature concerning chaotic systems.
// The underlying mathematical model is a variant of the Lorenz-84 attractor,
// utilizing specific coefficients derived from observations of chaotic phenomena.

// Execute the primary setup function once the document is fully loaded.
document.addEventListener('DOMContentLoaded', () => {

  // Reference to the main drawing surface.
  const visualCanvas = document.getElementById('renderSurface');
  if (!visualCanvas) {
    console.error('Render canvas not found. Aborting initialization.');
    return;
  }

  // Our rendering context provided by the Pre3d library.
  const sceneRenderer = new Pre3d.Renderer(visualCanvas);

  // Configure the line thickness for path rendering.
  sceneRenderer.ctx.lineWidth = 0.2;

  // Initial state variables for the chaotic system.
  let currentCoordX = 1.0;
  let currentCoordY = 1.0;
  let currentCoordZ = 1.0;

  // Function to advance the attractor's state by one time step.
  const advanceAttractorState = () => {
    // Define constants to make the equations clearer and potentially reusable.
    const alpha = -1.111;
    const beta = 1.111 * 4.494; // Combined constant.
    const gamma = -1.479;
    const delta = 0.44;
    const timeScale = 0.136; // Factor for the differential equations.

    // Calculate the change in X, Y, Z based on the Lorenz-84 system.
    let deltaX = (alpha * currentCoordX - currentCoordY * currentCoordY - currentCoordZ * currentCoordZ + beta) * timeScale;
    let deltaY = (-currentCoordY + currentCoordX * currentCoordY + gamma * currentCoordX * currentCoordZ + delta) * timeScale;
    let deltaZ = (-currentCoordZ + (-gamma) * currentCoordX * currentCoordY + currentCoordX * currentCoordZ) * timeScale;

    // Update the state variables.
    currentCoordX = currentCoordX + deltaX;
    currentCoordY += deltaY;
    currentCoordZ += deltaZ;

    // Return the new state as an object.
    return { xVal: currentCoordX, yVal: currentCoordY, zVal: currentCoordZ };
  };

  // Define the total number of points to generate for the path.
  const totalPathPoints = 7000;
  const visualPath = new Pre3d.Path();

  // Initialize the point and curve arrays with the required capacity.
  visualPath.points = Array.from({ length: totalPathPoints * 2 + 1 });
  visualPath.curves = Array.from({ length: totalPathPoints });

  // Perform an initial "warm-up" phase for the attractor.
  // This helps to settle the system into its characteristic chaotic behavior,
  // avoiding artifacts from the origin.
  let warmUpIterations = 10;
  while (warmUpIterations > 0) {
    advanceAttractorState();
    warmUpIterations--;
  }
  console.log('Attractor warm-up complete.');

  // Begin generating the actual path data for rendering.
  // previousPoint will store the last generated point for quadratic curve fitting.
  let previousPoint = advanceAttractorState();
  visualPath.points[visualPath.points.length - 1] = previousPoint;
  visualPath.starting_point = visualPath.points.length - 1;

  // Loop to generate all path segments.
  for (let segmentIndex = 0; segmentIndex < totalPathPoints; ++segmentIndex) {
    // Create a new quadratic curve segment.
    visualPath.curves[segmentIndex] = new Pre3d.Curve(segmentIndex * 2, segmentIndex * 2 + 1, null);

    // Generate two subsequent points for the curve fitting.
    let intermediatePoint = advanceAttractorState();
    let currentEndPoint = advanceAttractorState();

    // Fit a quadratic Bezier curve to the three points (previous, intermediate, current).
    visualPath.points[segmentIndex * 2 + 1] = Pre3d.PathUtils.fitQuadraticToPoints(
      previousPoint,
      intermediatePoint,
      currentEndPoint
    );
    visualPath.points[segmentIndex * 2] = currentEndPoint;
    previousPoint = currentEndPoint;
  }
  console.info(`Generated ${totalPathPoints} path segments.`);

  // Define a collection of color options for the visualization.
  const availableColorSchemes = [
    { label: 'red', colorVal: new Pre3d.RGBA(1, 0, 0, 1) },
    { label: 'green', colorVal: new Pre3d.RGBA(0, 1, 0, 1) },
    { label: 'blue', colorVal: new Pre3d.RGBA(0, 0, 1, 1) },
    { label: 'cyan', colorVal: new Pre3d.RGBA(0, 1, 1, 1) },
    { label: 'yellow', colorVal: new Pre3d.RGBA(1, 1, 0, 1) },
    { label: 'white', colorVal: new Pre3d.RGBA(1, 1, 1, 1) }
  ];

  // The currently selected foreground color for the path.
  let activeForegroundColor = new Pre3d.RGBA(1, 0, 0, 1);

  // Function to render the current state of the scene.
  const renderScene = () => {
    // Clear the background to black.
    sceneRenderer.ctx.setFillColor(0, 0, 0, 1);
    sceneRenderer.drawBackground();

    // Set the stroke color for the path from the active color.
    // Using object destructuring for color components.
    const { r, g, b, a } = activeForegroundColor;
    sceneRenderer.ctx.setStrokeColor(r, g, b, a);

    // Draw the generated attractor path.
    sceneRenderer.drawPath(visualPath);
  };

  // Create UI elements for changing the path color.
  const colorControlPanel = document.createElement('div');
  // Add a descriptive text label.
  colorControlPanel.appendChild(document.createTextNode(`Choose Path Color → `));

  // Iterate through the defined color schemes and create clickable links.
  availableColorSchemes.forEach(schemeOption => {
    const colorLink = document.createElement('a');
    colorLink.href = '#';

    // Attach an event handler to update the color and redraw.
    colorLink.onclick = (event) => {
      event.preventDefault(); // Prevent default link behavior (page jump).
      activeForegroundColor = schemeOption.colorVal;
      renderScene(); // Redraw the scene with the new color.
      return false;
    };

    colorLink.appendChild(document.createTextNode(schemeOption.label));
    colorControlPanel.appendChild(colorLink);
    // Add a space between links for better readability.
    colorControlPanel.appendChild(document.createTextNode(' '));
  });

  // Insert the color control panel at the very beginning of the document body.
  document.body.insertBefore(colorControlPanel, document.body.firstChild);

  // Configure the camera's focal length.
  sceneRenderer.camera.focal_length = 2.5;

  // Use the utility function to enable interactive camera control.
  const cameraInitialParams = {
      offsetX: 0,
      offsetY: 0,
      offsetZ: -15,
      rotateX: 0,
      rotateY: -1.7,
      rotateZ: 0
  };
  DemoUtils.autoCamera(
      sceneRenderer,
      cameraInitialParams.offsetX,
      cameraInitialParams.offsetY,
      cameraInitialParams.offsetZ,
      cameraInitialParams.rotateX,
      cameraInitialParams.rotateY,
      cameraInitialParams.rotateZ,
      renderScene
  );

  // Perform the initial drawing of the scene.
  console.log('Initial scene render triggered.');
  renderScene();

});