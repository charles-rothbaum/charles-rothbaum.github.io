// Helper function to load shader source code with cache-busting
async function loadShaderSource(url) {
  const response = await fetch(url + '?v=' + Date.now());
  if (!response.ok) {
    console.error(`Failed to load shader from ${url}`);
    return null;
  }
  return await response.text();
}

// Helper function to compile a shader
async function compileShader(gl, source, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compilation error", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

// Initialization function for Cell 1
async function cell1_init() {
  const container = document.querySelector('#cell1 .widget-container');
  container.innerHTML = '<canvas id="cell1_canvas" width="640" height="640"></canvas>';

  const canvas = document.getElementById('cell1_canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    container.innerHTML = '<p>Your browser does not support WebGL.</p>';
    return;
  }

  // Compile shaders from source files
  const vertexShaderSource = await loadShaderSource('cell1/shaders/vertex.glsl');
  const fragmentShaderSource = await loadShaderSource('cell1/shaders/fragment.glsl');

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
  const frequencyUniformLocation = gl.getUniformLocation(shaderProgram, "u_frequency");
  const amplitudeUniformLocation = gl.getUniformLocation(shaderProgram, "u_amplitude");
  const iterationsUniformLocation = gl.getUniformLocation(shaderProgram, "u_iterations");
  const asymmetryUniformLocation = gl.getUniformLocation(shaderProgram, "u_asymmetry");

  // Set initial uniform values
  gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
  gl.uniform1f(frequencyUniformLocation, 28.0);
  gl.uniform1f(amplitudeUniformLocation, 20.0);
  gl.uniform1f(iterationsUniformLocation, 4.0);
  gl.uniform1f(asymmetryUniformLocation, 1.5);

  // Define vertices for a full-screen triangle strip
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

  // Attach update functions to the global window object for slider controls
  window.updateFrequency = (value) => {
    gl.uniform1f(frequencyUniformLocation, parseFloat(value));
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };
  window.updateAmplitude = (value) => {
    gl.uniform1f(amplitudeUniformLocation, parseFloat(value));
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };
  window.updateIterations = (value) => {
    gl.uniform1f(iterationsUniformLocation, parseFloat(value));
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };
  window.updateAsymmetry = (value) => {
    gl.uniform1f(asymmetryUniformLocation, parseFloat(value));
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  // Start the animation loop
  requestAnimationFrame(render);

  // Set viewport and clear color
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.2, 0.4, 0.6, 1.0);
}

// Cleanup function for Cell 1
function cell1_cleanup() {
  // Cancel the animation loop if it exists
  if (window.cell1Animation) {
    cancelAnimationFrame(window.cell1Animation);
    window.cell1Animation = null;
  }
  const container = document.querySelector('#cell1 .widget-container');
  container.innerHTML = '';
}
