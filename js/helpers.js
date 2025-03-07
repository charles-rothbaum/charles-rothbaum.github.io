// helpers.js
export async function loadShaderSource(url) {
    const response = await fetch(url + '?v=' + Date.now());
    if (!response.ok) {
      console.error(`Failed to load shader from ${url}`);
      return null;
    }
    return await response.text();
  }
  
  export async function compileShader(gl, source, type) {
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
  