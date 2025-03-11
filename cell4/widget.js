import { animate } from "https://cdn.jsdelivr.net/npm/motion@latest/+esm";

// Constants and state variables
const MAX_TAPE_LENGTH = 20;
let tape = new Array(MAX_TAPE_LENGTH).fill("");
let headPosition = Math.floor(MAX_TAPE_LENGTH / 2);
let offset = 0;
let simulationSpeed = 500; // in milliseconds
let rules = [];
let running = false;
let simulationInterval = simulationSpeed / 1000;

// DOM element references
const tapeContainer = document.getElementById('tape-container'); // should be your visible area with overflow hidden
const tapeWrapper = document.getElementById('tape-wrapper');
const scrollLeftButton = document.getElementById('scroll-left');
const scrollRightButton = document.getElementById('scroll-right');
const runButton = document.getElementById('run');
const stepButton = document.getElementById('step');
const stopButton = document.getElementById('stop');
const resetButton = document.getElementById('reset');
const speedSlider = document.getElementById('speed-slider');
const addRuleButton = document.getElementById('add-rule');
const rulesEditor = document.getElementById('rules-editor');
const errorMessageEl = document.getElementById('error-message');
const successMessageEl = document.getElementById('success-message');
const configNameInput = document.getElementById('config-name');
const saveConfigButton = document.getElementById('save-config');
const loadConfigButton = document.getElementById('load-config');
const logoutButton = document.getElementById('logout-button');

function initOffset() {
  for (let i = 0; i < headPosition; i++) {
    updateTapeAnimation(1);
  }
}

function initRules() {
  rules.push({ name: "v", readSymbol: "", writeSymbol: "1", nextState: "1", moveDirection: "R" });
  rules.push({ name: "u", readSymbol: "0", writeSymbol: "1", nextState: "1", moveDirection: "R" });
  rules.push({ name: "t", readSymbol: "1", writeSymbol: "0", nextState: "0", moveDirection: "L" });
  rules.push({ name: "s", readSymbol: "", writeSymbol: "", nextState: "h", moveDirection: "L" });
  rules.push({ name: "r", readSymbol: "0", writeSymbol: "0", nextState: "1", moveDirection: "R" });
  rules.push({ name: "q", readSymbol: "1", writeSymbol: "1", nextState: "1", moveDirection: "R" });

}

function incrementHead(direction) {
  headPosition = Math.max(headPosition - 1, 0);
}
function decrementHead(direction) {
  headPosition = Math.min(headPosition + 1, tape.length - 1);
}

function calculateOffset() {
  const cellWidth = 50; // must match your CSS
  // Use the actual container width if available; default to 600px if not
  const containerWidth = tapeContainer.clientWidth || 600;
  // Center the head cell: container center minus the center of the head cell.
  return containerWidth / 2 - (headPosition * cellWidth + cellWidth / 2);
}


function updateTapeAnimation() {
  const newOffset = calculateOffset();
  // Animate the transform property of the tapeWrapper using Motion
  animate(
    tapeWrapper,
    { transform: `translateX(${newOffset}px)` },
    { duration: simulationInterval }
  );
  renderTape();
}

// Simulation: "Run" button handler (simple demo logic)
function handleRun() {
  if (running) return;
  running = true;

  while (running) {
    let currentSymbol = tape[headPosition];
    let currentRule = rules.find(rule => rule.readSymbol === currentSymbol);
    if (!currentRule) {
      handleStop();
      errorMessageEl.innerText = "Halted: No matching rule found";
      return;
    }
    // Write symbol and move head
    tape[headPosition] = currentRule.writeSymbol;
    if (currentRule.moveDirection === 'R') {
      updateTapeAnimation(1);
      headPosition = Math.max(headPosition - 1, 0);
    } else if (currentRule.moveDirection === 'L') {
      updateTapeAnimation(0);
      headPosition = Math.min(headPosition + 1, tape.length - 1);
    }
    renderTape();
  }
}

// Simulation: "Step" button handler (one iteration)
function handleStep() {

}

// Stop simulation
function handleStop() {
  running = false;
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
}

// Reset simulation state
function handleReset() {
  handleStop();
  tape = new Array(MAX_TAPE_LENGTH).fill("");
  headPosition = Math.floor(MAX_TAPE_LENGTH / 2);
  renderTape();
}

// Adjust simulation speed from slider
function handleSliderChange(e) {
  simulationSpeed = parseInt(e.target.value, 10);
  if (running) {
    handleStop();
    handleRun();
  }
}

function renderTape() {
  tapeWrapper.innerHTML = "";
  for (let i = 0; i < tape.length; i++) {
    const cellDiv = document.createElement('div');
    cellDiv.className = "tape-cell" + (i === headPosition ? " head" : "");
    const input = document.createElement('input');
    input.type = 'text';
    input.value = tape[i];
    input.maxLength = 1;
    input.addEventListener('change', (e) => {
      tape[i] = e.target.value;
    });
    cellDiv.appendChild(input);
    tapeWrapper.appendChild(cellDiv);
  }
}

function renderRules() {
  rulesEditor.innerHTML = "";
  rules.forEach((rule, index) => {
    const ruleDiv = document.createElement('div');
    // Create input fields for each property
    const fields = ['name', 'readSymbol', 'writeSymbol', 'nextState', 'moveDirection'];
    fields.forEach(field => {
      const input = document.createElement('input');
      input.placeholder = field;
      input.value = rule[field] || "";
      input.addEventListener('input', (e) => {
        rule[field] = e.target.value;
      });
      ruleDiv.appendChild(input);
    });
    // Delete button for each rule
    const delBtn = document.createElement('button');
    delBtn.innerText = "Delete Rule";
    delBtn.addEventListener('click', () => {
      rules.splice(index, 1);
      renderRules();
    });
    ruleDiv.appendChild(delBtn);
    rulesEditor.appendChild(ruleDiv);
  });
}

scrollRightButton.addEventListener('click', () => {
  if (headPosition < tape.length - 1) {
    headPosition++;
    updateTapeAnimation();
  }
});
scrollLeftButton.addEventListener('click', () => {
  if (headPosition > 0) {
    headPosition--;
    updateTapeAnimation();
  }
});

runButton.addEventListener('click', handleRun);
stepButton.addEventListener('click', handleStep);
stopButton.addEventListener('click', handleStop);
resetButton.addEventListener('click', handleReset);
speedSlider.addEventListener('input', handleSliderChange);
addRuleButton.addEventListener('click', () => {
  // Add an empty rule object
  rules.push({ name: "", readSymbol: "", writeSymbol: "", nextState: "", moveDirection: "" });
  renderRules();
});

// Initial render
initOffset();
initRules();
renderTape();
renderRules();