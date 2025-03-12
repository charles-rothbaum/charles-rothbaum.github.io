import { loadShaderSource, compileShader } from '../js/helpers.js';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createShaderProgram(gl, vertexSrc, fragmentSrc) {
  const vertexShader = await compileShader(gl, vertexSrc, gl.VERTEX_SHADER);
  const fragmentShader = await compileShader(gl, fragmentSrc, gl.FRAGMENT_SHADER);

  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Shader program link error:', gl.getProgramInfoLog(program));
    return null;
  }

  return program;
}

export async function cell5_init() {
  const container = document.querySelector('#cell5 .widget-container');
  container.innerHTML = `
    <canvas id="cell5_canvas" width="640" height="640"></canvas>
  `;

  const canvas = document.getElementById('cell5_canvas');
  // Disable antialiasing for crisp pixel edges
  const gl = canvas.getContext('webgl', { antialias: false }) || 
             canvas.getContext('experimental-webgl', { antialias: false });
  if (!gl) {
    container.innerHTML = '<p>Your browser does not support WebGL.</p>';
    return;
  }

  // Set CSS to scale up the canvas without smoothing.
  // Adjust these dimensions to suit your display needs.
  canvas.style.width = "640px";
  canvas.style.height = "640px";
  canvas.style.imageRendering = "pixelated";  // Ensure the scaling is crisp

  // Load shader sources
  const [vertexShaderSrc, fragmentShaderSrc, bufferShaderSrc] = await Promise.all([
    loadShaderSource('cell5/shaders/vertex.glsl'),
    loadShaderSource('cell5/shaders/fragment.glsl'),
    loadShaderSource('cell5/shaders/buffer.glsl')
  ]);

  if (!vertexShaderSrc || !fragmentShaderSrc || !bufferShaderSrc) {
    console.error("Error loading shaders.");
    return;
  }

  // Create shader programs
  const bufferProgram = await createShaderProgram(gl, vertexShaderSrc, bufferShaderSrc);
  const finalProgram = await createShaderProgram(gl, vertexShaderSrc, fragmentShaderSrc);
  if (!bufferProgram || !finalProgram) return;

  // Quad vertices
  const vertices = new Float32Array([
    -1.0, -1.0,  1.0, -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0, -1.0,  1.0,  1.0
  ]);

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  function setupAttribs(program) {
    const positionAttribLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.vertexAttribPointer(positionAttribLocation, 2, gl.FLOAT, false, 0, 0);
  }

  function createFramebuffer() {
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA,
      canvas.width, canvas.height, 0,
      gl.RGBA, gl.UNSIGNED_BYTE, null
    );
    // Set texture parameters for a crisp, pixelated look:
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Attach the texture to the framebuffer
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);

    // Check for framebuffer completeness
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      console.error('Framebuffer not complete');
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { fbo, tex };
  }

  // Create two framebuffers for ping-pong rendering
  const fbo1 = createFramebuffer();
  const fbo2 = createFramebuffer();

  const startButton = document.getElementById('start-random');


  let currentFBO = fbo1;
  let previousFBO = fbo2;

  // Uniform locations
  const uniforms = {
    buffer: {
      program: bufferProgram,
      time: gl.getUniformLocation(bufferProgram, "u_time"),
      resolution: gl.getUniformLocation(bufferProgram, "u_resolution"),
      previousFrame: gl.getUniformLocation(bufferProgram, "u_previousFrame"),
    },
    final: {
      program: finalProgram,
      time: gl.getUniformLocation(finalProgram, "u_time"),
      resolution: gl.getUniformLocation(finalProgram, "u_resolution"),
      buffer: gl.getUniformLocation(finalProgram, "u_buffer"),
    }
  };

  let resetTime = false;

  startButton.addEventListener('click', () => {
    resetTime = true;
  });

  let seconds = 0.01;
  async function render(time) {
    seconds = time * 0.001;

    if (resetTime) {
      seconds = 0.0;
      resetTime = false;
    } else {
      seconds = time * 0.001;
    }

    // --- Buffer Pass (Write to Current FBO) ---
    gl.bindFramebuffer(gl.FRAMEBUFFER, currentFBO.fbo);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(bufferProgram);

    // Update uniforms for the buffer pass
    gl.uniform1f(uniforms.buffer.time, seconds);
    gl.uniform2f(uniforms.buffer.resolution, canvas.width, canvas.height);

    // Bind the previous frame as input
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, previousFBO.tex);
    gl.uniform1i(uniforms.buffer.previousFrame, 0);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // --- Final Pass (Render to Screen) ---
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(finalProgram);
    setupAttribs(finalProgram);

    // Update uniforms for the final pass
    gl.uniform1f(uniforms.final.time, seconds);
    gl.uniform2f(uniforms.final.resolution, canvas.width, canvas.height);

    // Bind the latest buffer as input
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, currentFBO.tex);
    gl.uniform1i(uniforms.final.buffer, 0);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Swap framebuffers for ping-pong rendering
    let temp = currentFBO;
    currentFBO = previousFBO;
    previousFBO = temp;

    await sleep(1);

    requestAnimationFrame(render);

  }

  requestAnimationFrame(render);
}

window.cell5_init = cell5_init;
