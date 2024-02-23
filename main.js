const minGridSize = '8';
const maxGridSize = '96';
const stepSize = '8';
const minAlpha = 0.1;
const maxAlpha = 1;
const defaultColor = '#000000';
const defaultBgColor = '#ffffff';

let gridSize = minGridSize;
let color = defaultColor;
let bgColor = defaultBgColor;

let hasRandomMode = false;
let hasEraseMode = false;
let hasReset = false;
let hasAlpha = false;
let hasInit = false;

const initParagraphTexts = [
  'use 🧹 button or \'right mouse\' click to erase',
  'use 🖌️ button to add alpha',
  "use 🪄 button for 'magic' color",
  'use 🔁 to reset all',
  "use the slider to resize the grid size \n(any progress won't be saved!)",
];

/* Preserve Elements */
const boardEl = document.querySelector('#board');
const resetButtonEl = document.querySelector('#reset-button');
const eraseButtonEl = document.querySelector('#erase-button');
const randomButtonEl = document.querySelector('#random-button');
const alphaButtonEl = document.querySelector('#alpha-button');
const sizeSliderEl = document.querySelector('#size-slider');
const sliderText = document.querySelector('#slider-text');
const colorPicker = document.querySelector('#color-picker');
const colorPickerBg = document.querySelector('#color-picker-bg');
const screenEl = document.querySelector('#screen');

/* Created Elements */
const overlayEl = document.createElement('div');
const safeAreaEl = document.createElement('div');
const overlayFirstButton = document.createElement('button');
const overlayButtonContainer = document.createElement('div');
const overlayHeading = document.createElement('h2');
const overlayContent = document.createElement('div');

const EVENTS = {
  RENDER: 'RENDER',
  POPUP: 'POPUP',
  ERROR: 'ERROR',
};

const MoveEvents = ['mousemove', 'touchmove'];
const DownEvents = ['mousedown', 'touchstart'];

document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
document.addEventListener(EVENTS.RENDER, onRender);

function onDOMContentLoaded() {
  document.dispatchEvent(new Event(EVENTS.RENDER));
}

function onRender() {
  if (hasInit == false) {
    initRender();
  }
  if (hasReset == true) {
    reset();
  }

  renderGrid();
}

function initRender() {
  overlayEl.classList.add('overlay');
  safeAreaEl.classList.add('safe-area');
  overlayFirstButton.classList.add('button');
  overlayButtonContainer.classList.add('button-container');
  overlayHeading.classList.add('title');
  overlayContent.classList.add('content');
  overlayFirstButton.textContent = 'Close';

  overlayHeading.textContent = 'HINTS';

  const ulEL = document.createElement('ul');
  initParagraphTexts.forEach((p) => {
    const liEl = document.createElement('li');
    liEl.textContent = p;
    ulEL.append(liEl);
  });

  overlayContent.append(ulEL);
  overlayButtonContainer.append(overlayFirstButton);

  safeAreaEl.append(overlayHeading);
  safeAreaEl.append(overlayContent);
  safeAreaEl.append(overlayButtonContainer);
  overlayEl.append(safeAreaEl);
  screenEl.append(overlayEl);

  sliderText.textContent = `${minGridSize} x ${minGridSize}`;

  sizeSliderEl.setAttribute('value', gridSize);
  sizeSliderEl.setAttribute('min', minGridSize);
  sizeSliderEl.setAttribute('max', maxGridSize);
  sizeSliderEl.setAttribute('step', stepSize);

  sizeSliderEl.addEventListener('input', (event) => {
    gridSize = event.target.value;
    sliderText.textContent = `${gridSize} x ${gridSize}`;
    document.dispatchEvent(new Event(EVENTS.RENDER));
  });

  colorPicker.setAttribute('value', defaultColor);
  colorPicker.addEventListener('input', (event) => {
    color = event.target.value;
  });

  colorPickerBg.setAttribute('value', defaultBgColor);
  colorPickerBg.addEventListener('input', (event) => {
    boardEl.style.background = event.target.value;
  });

  resetButtonEl.addEventListener('click', () => {
    gridSize = minGridSize;
    color = defaultColor;
    bgColor = defaultBgColor;
    hasRandomMode = false;
    hasAlpha = false;
    hasEraseMode = false;
    hasReset = true;

    document.dispatchEvent(new Event(EVENTS.RENDER));
  });

  alphaButtonEl.addEventListener('click', () => {
    hasAlpha = !hasAlpha;
    hasEraseMode = false;
    hasRandomMode = false;

    if (hasAlpha) {
      alphaButtonEl.classList.add('active');
      eraseButtonEl.classList.remove('active');
      randomButtonEl.classList.remove('active');
    } else {
      alphaButtonEl.classList.remove('active');
    }
  });

  eraseButtonEl.addEventListener('click', () => {
    hasEraseMode = !hasEraseMode;
    hasRandomMode = false;
    hasAlpha = false;

    if (hasEraseMode) {
      eraseButtonEl.classList.add('active');
      randomButtonEl.classList.remove('active');
      alphaButtonEl.classList.remove('active');
    } else {
      eraseButtonEl.classList.remove('active');
    }
  });

  randomButtonEl.addEventListener('click', () => {
    hasRandomMode = !hasRandomMode;
    hasEraseMode = false;
    hasAlpha = false;

    if (hasRandomMode) {
      randomButtonEl.classList.add('active');
      eraseButtonEl.classList.remove('active');
      alphaButtonEl.classList.remove('active');
    } else {
      randomButtonEl.classList.remove('active');
    }
  });

  overlayFirstButton.addEventListener(
    'click',
    () => {
      hideOverlay();
      enableAllButtonsAndInput();
    },
    { once: true }
  );

  disableAllButtonsAndInput();
  showOverlayEl();

  hasInit = true;
}

function renderGrid() {
  if (boardEl.hasChildNodes()) {
    boardEl.removeChild(boardEl.firstChild);
  }
  const gridEl = generateGrid(gridSize);
  boardEl.append(gridEl);
}

function generateGrid(size = 1) {
  if (size <= 0) {
    return null;
  }

  const gridContainerEl = document.createElement('div');
  gridContainerEl.classList.add('container');

  const gridSize = size;

  for (let i = 0; i < gridSize; i++) {
    const cellRowEl = document.createElement('div');
    cellRowEl.classList.add('cell-row');
    cellRowEl.setAttribute('id', 'cell-row-' + i);

    for (let j = 0; j < gridSize; j++) {
      let alpha = 0;
      const cellColEl = document.createElement('div');
      cellColEl.classList.add('cell-col');
      cellColEl.setAttribute('id', 'cell-col-' + i + j);
      cellColEl.setAttribute('data-alpha', alpha);
      cellColEl.setAttribute('data-has-colored', false);

      DownEvents.forEach((downEvent) => {
        cellColEl.addEventListener(downEvent, (event) => {
          event.preventDefault();

          if (event.touches) {
            const touch = event.touches[0];
            const cell = document.elementFromPoint(
              touch.clientX,
              touch.clientY
            );

            drawOnCellElement(cell, alpha);
          }

          if (event.buttons) {
            const buttons = event.buttons;
            const cell = event.target;

            if (buttons == 1) {
              drawOnCellElement(cell, alpha);
            }
          }
        });
      });

      MoveEvents.forEach((moveEvent) => {
        cellColEl.addEventListener(moveEvent, (event) => {
          if (event.touches) {
            const touch = event.touches[0];
            const cell = document.elementFromPoint(
              touch.clientX,
              touch.clientY
            );
            drawOnCellElement(cell, alpha);
          }

          if (event.buttons) {
            const buttons = event.buttons;
            const cell = event.target;

            if (buttons == 1) {
              drawOnCellElement(cell, alpha);
            } else if (buttons == 2) {
              cell.style.background = 'transparent';
              cell.dataset.alpha = 0;
            }
          }
        });
      });

      cellColEl.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        return false;
      });

      cellRowEl.append(cellColEl);
    }
    gridContainerEl.append(cellRowEl);
  }
  return gridContainerEl;
}

function reset() {
  sizeSliderEl.value = gridSize;
  colorPicker.value = color;
  colorPickerBg.value = bgColor;
  sliderText.textContent = `${gridSize} x ${gridSize}`;
  boardEl.style.background = bgColor;
  eraseButtonEl.classList.remove('active');
  alphaButtonEl.classList.remove('active');
  randomButtonEl.classList.remove('active');
  hasReset = false;
}

function getRandomHexColor() {
  const colorNum = Math.round((Math.random() * 0xffffff) << 0).toString(16);
  return `#${colorNum}`;
}

function getElementXY(el) {
  const rect = el.getBoundingClientRect();
  const x = rect.left + window.scrollX;
  const y = rect.top + window.scrollY;
  return { x, y };
}

function shortHexToRGB(hex) {
  let r = hex.slice(1, 2);
  let g = hex.slice(2, 3);
  let b = hex.slice(3, 4);

  r = parseInt(r + r, 16);
  g = parseInt(g + g, 16);
  b = parseInt(b + b, 16);

  return { r, g, b };
}

function getRGBfromHex(hex) {
  if (hex.length === 4) {
    return shortHexToRGB(hex);
  }

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return { r, g, b };
}

function fillColorToElement(element, alpha = 1) {
  if (hasRandomMode) {
    const randHex = getRandomHexColor();
    const { r, g, b } = getRGBfromHex(randHex);
    element.style.background = `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } else if (hasEraseMode) {
    element.style.background = 'transparent';
    element.dataset.alpha = 0;
  } else {
    const { r, g, b } = getRGBfromHex(color);
    element.style.background = `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

function drawOnCellElement(cell, alpha = 1) {
  if (hasAlpha) {
    let parsed = parseFloat(cell.dataset.alpha);
    cell.dataset.alpha = `${parsed + minAlpha}`;
    alpha = parseFloat(cell.dataset.alpha);
  } else {
    cell.dataset.alpha = `${maxAlpha}`;
    alpha = parseFloat(cell.dataset.alpha);
  }

  if (cell) {
    const isCellCol = cell.classList.contains('cell-col');
    if (isCellCol) {
      fillColorToElement(cell, alpha);
    }
  }
}

function showOverlayEl() {
  overlayEl.classList.add('show');
}

function hideOverlay() {
  overlayEl.classList.remove('show');
}

function disableAllButtonsAndInput() {
  colorPicker.disabled = true;
  colorPickerBg.disabled = true;
  resetButtonEl.disabled = true;
  randomButtonEl.disabled = true;
  alphaButtonEl.disabled = true;
  eraseButtonEl.disabled = true;
}

function enableAllButtonsAndInput() {
  colorPicker.disabled = false;
  colorPickerBg.disabled = false;
  resetButtonEl.disabled = false;
  randomButtonEl.disabled = false;
  alphaButtonEl.disabled = false;
  eraseButtonEl.disabled = false;
}
