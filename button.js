const clickControls = () => {
  gameClick('controls', 'block');
};

const clickCloseControls = () => {
  gameClick('controls', 'none');
};

const clickAbout = () => {
  gameClick('about', 'block');
};

const clickCloseAbout = () => {
  gameClick('about', 'none');
};

const gameClick = (elementId, displayValue) => {
  document.getElementById(elementId).style.display = displayValue;
};

// const clickControls = () => {
//   document.getElementById(elementId).style.display = n;
// };
