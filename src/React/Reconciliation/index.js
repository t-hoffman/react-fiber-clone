/**
 * EVENT WORK LOOP FOR LIFECYCLE EVENTS AND RENDERING.
 * FIBER NODES TO BE INITIATED/TRANSFORMED HERE.
 * THIS IS THE MAIN FIBER ALGORITHM.
 */

const requestIdleCallback = window.requestIdleCallback;

function createQueue() {
  const taskQueue = [];

  return {
    pop: () => taskQueue.shift(),
    push: (item) => taskQueue.push(item),
    isEmpty: () => taskQueue.length === 0,
  };
}

const ENOUGH_TIME = 1;
const taskQueue = createQueue();
let subTask = null;

function getFirstSubTask() {}

function executeSubTask(subTask) {
  return;
}

function workLoop(deadline) {
  if (!subTask) {
    subTask = getFirstSubTask();
  }

  while (subTask && deadline.timeRemaining() > ENOUGH_TIME) {
    subTask = executeSubTask(subTask);
  }
}

function performTask(deadline) {
  workLoop(deadline);

  if (subTask || taskQueue.length > 0) {
    requestIdleCallback(performTask);
  }
}

export function render(element, DOMNode) {
  // temporary
  DOMNode.appendChild(element);

  taskQueue.push({ element, DOMNode });

  requestIdleCallback(performTask);
}
