import { loadShaderSource, compileShader } from '../js/helpers.js';

// Initialization function for Cell 1
export async function cell3_init() {
  const container = document.querySelector('#cell3 .widget-container');
  container.innerHTML = '<canvas id="cell3_canvas" width="640" height="640"></canvas>';

  const canvas = document.getElementById('cell3_canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    container.innerHTML = '<p>Your browser does not support WebGL.</p>';
    return;
  }

  // Compile shaders from source files
  const vertexShaderSource = await loadShaderSource('cell3/shaders/vertex.glsl');
  const fragmentShaderSource = await loadShaderSource('cell3/shaders/fragment.glsl');

  if (!vertexShaderSource || !fragmentShaderSource) {
    console.error("Error loading shaders.");
    return;
  }

  const vertexShader = await compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
  const fragmentShader = await compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

  if (!vertexShader || !fragmentShader) {
    console.error("Shader compilation failed.");
    return;
  }

  // Create and use the shader program
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  gl.useProgram(shaderProgram);

  // Get uniform locations
  const timeUniformLocation = gl.getUniformLocation(shaderProgram, "u_time");
  const resolutionUniformLocation = gl.getUniformLocation(shaderProgram, "u_resolution");
  const mouseUniformLocation = gl.getUniformLocation(shaderProgram, "u_mouse");
  const recursionsUniformLocation = gl.getUniformLocation(shaderProgram, "u_recursions")
  const thetaUniformLocation = gl.getUniformLocation(shaderProgram, "u_theta");
  const speedUniformLocation = gl.getUniformLocation(shaderProgram, "u_speed");

  // Set initial uniform values
  gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
  gl.uniform1f(recursionsUniformLocation, 5);
  gl.uniform1f(thetaUniformLocation, 0.78)
  gl.uniform1f(speedUniformLocation, 0.2)

  window.updateRecursions = (value) => {
    gl.uniform1f(recursionsUniformLocation, parseFloat(value));
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  window.updateTheta = (value) => {
    gl.uniform1f(thetaUniformLocation, parseFloat(value));
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  window.updateSpeed = (value) => {
    gl.uniform1f(speedUniformLocation, parseFloat(value));
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const normMouseX = mouseX;
    const normMouseY = canvas.height - mouseY;

    gl.useProgram(shaderProgram);
    gl.uniform2f(mouseUniformLocation, normMouseX, normMouseY);
  });

  const vertices = new Float32Array([
    -1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
    -1.0, 1.0, 1.0, -1.0, 1.0, 1.0
  ]);

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const positionAttribLocation = gl.getAttribLocation(shaderProgram, "a_position");
  gl.enableVertexAttribArray(positionAttribLocation);
  gl.vertexAttribPointer(positionAttribLocation, 2, gl.FLOAT, false, 0, 0);

  // Render function for animation
  function render(time) {
    const seconds = time * 0.001;
    gl.uniform1f(timeUniformLocation, seconds);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  }
  // Start the animation loop
  requestAnimationFrame(render);

  // Set viewport and clear color
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.2, 0.4, 0.6, 1.0);
}
window.cell3_init = cell3_init;

// Cleanup function for Cell 1
function cell3_cleanup() {
  // Cancel the animation loop if it exists
  if (window.cell3Animation) {
    cancelAnimationFrame(window.cell3Animation);
    window.cell3Animation = null;
  }
  const container = document.querySelector('#cell3 .widget-container');
  container.innerHTML = '';
}
