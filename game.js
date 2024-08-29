const canvas = document.getElementById('gameCanvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    alert('WebGL not supported');
}

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Vertex shader program
const vsSource = `
attribute vec4 a_position;
uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectionMatrix;
void main() {
    gl_Position = u_projectionMatrix * u_modelViewMatrix * a_position;
}`;

// Fragment shader program
const fsSource = `
precision mediump float;
uniform vec4 u_color;
void main() {
    gl_FragColor = u_color;
}`;

// Compile shader
function compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// Create program
function createProgram(gl, vsSource, fsSource) {
    const vertexShader = compileShader(gl, vsSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

const program = createProgram(gl, vsSource, fsSource);

const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
const modelViewMatrixLocation = gl.getUniformLocation(program, 'u_modelViewMatrix');
const projectionMatrixLocation = gl.getUniformLocation(program, 'u_projectionMatrix');
const colorLocation = gl.getUniformLocation(program, 'u_color');

// Define vertices for a cube
const vertices = new Float32Array([
    -0.5, -0.5, -0.5,
    0.5, -0.5, -0.5,
    0.5, 0.5, -0.5,
    -0.5, 0.5, -0.5,
    -0.5, -0.5, 0.5,
    0.5, -0.5, 0.5,
    0.5, 0.5, 0.5,
    -0.5, 0.5, 0.5,
]);

// Define indices for the cube
const indices = new Uint16Array([
    0, 1, 2, 0, 2, 3,
    4, 5, 6, 4, 6, 7,
    0, 1, 5, 0, 5, 4,
    2, 3, 7, 2, 7, 6,
    0, 3, 7, 0, 7, 4,
    1, 2, 6, 1, 6, 5
]);

// Create buffer and load vertex data
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// Create index buffer
const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

const cube

// Set up cube vertices
const cubeVertexArray = new Float32Array(vertices);
const cubeVertexCount = vertices.length / 3;

const indexArray = new Uint16Array(indices);
const indexCount = indices.length;

const projectionMatrix = mat4.create();
const modelViewMatrix = mat4.create();

// Initialize camera
const cameraPosition = [0, 0, 5];
const cameraTarget = [0, 0, 0];
const upDirection = [0, 1, 0];

function updateProjectionMatrix() {
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 100);
}

function updateModelViewMatrix() {
    mat4.lookAt(modelViewMatrix, cameraPosition, cameraTarget, upDirection);
}

function setupShaders() {
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionAttributeLocation);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertexArray, gl.STATIC_DRAW);

    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
}

function drawCube() {
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLocation, false, modelViewMatrix);

    gl.uniform4f(colorLocation, 0.0, 1.0, 0.0, 1.0); // Green color
    gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
}

// Bullet handling
const bullets = [];
const bulletSpeed = 0.1;
let maxBullets = 10;
let currentBullets = maxBullets;

function shootBullet() {
    if (currentBullets > 0) {
        bullets.push({
            x: cameraPosition[0],
            y: cameraPosition[1],
            z: cameraPosition[2] - 1
        });
        currentBullets--;
        updateBulletCountDisplay();
    }
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.z -= bulletSpeed;
        if (bullet.z < -10) { // Remove bullets that go out of bounds
            bullets.splice(i, 1);
        }
    }
}

function drawBullets() {
    gl.useProgram(program);
    gl.uniform4f(colorLocation, 1.0, 0.0, 0.0, 1.0); // Red color
    for (const bullet of bullets) {
        // Draw bullet as a small cube or sphere
        // For simplicity, using the same cube drawing method here
        mat4.translate(modelViewMatrix, modelViewMatrix, [bullet.x, bullet.y, bullet.z]);
        drawCube();
        mat4.translate(modelViewMatrix, modelViewMatrix, [-bullet.x, -bullet.y, -bullet.z]);
    }
}

function updateBulletCountDisplay() {
    // Update display logic for bullet count
    document.getElementById('bulletCount').textContent = `Bullets: ${currentBullets}`;
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        shootBullet();
    }
});

// Main render loop
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    updateProjectionMatrix();
    updateModelViewMatrix();

    drawCube();
    updateBullets();
    drawBullets();

    requestAnimationFrame(render);
}

// Initialize WebGL
gl.clearColor(0.0, 0.0, 0.0, 1.0); // Black background
gl.enable(gl.DEPTH_TEST); // Enable depth testing

// Start rendering
render();
