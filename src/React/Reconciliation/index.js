/**
 * EVENT WORK LOOP FOR LIFECYCLE EVENTS AND RENDERING.
 * FIBER NODES TO BE INITIATED/TRANSFORMED HERE.
 * THIS IS THE MAIN FIBER ALGORITHM.
 */

import { arrify, createQueue, requestIdleCallback } from "../Misc";
import {
  ENOUGH_TIME,
  HOST_COMPONENT,
  HOST_ROOT,
  PLACEMENT,
  UPDATE,
  DELETION,
} from "./../Constants";
import { createDOMElement, updateDOMElement } from "../DOM";

const taskQueue = createQueue();
let subTask = null;
let pendingCommit = null;

function getFirstSubTask() {
  let task = taskQueue.pop();

  return {
    props: task.newProps,
    alternate: task.dom.__rootFiberContainer,
    stateNode: task.dom,
    tag: HOST_ROOT,
    effects: [],
  };
}

function reconcileChildren(fiber, children) {
  const arrifiedChildren = arrify(children);
  let alternate;

  if (fiber.alternate && fiber.alternate.child) {
    alternate = fiber.alternate.child;
  }

  // If there are no children to render, return without
  // creating new Fiber.

  if (arrifiedChildren.length === 0) {
    // If there is an alternate while there is no child
    // that means the DOMNode got deleted.

    if (alternate) {
      alternate.effectTag = DELETION;
      fiber.effects.push(alternate);
    }

    return;
  }

  if (alternate && arrifiedChildren[0].type !== alternate.type) {
    const newFiber = {
      alternate,
      props: arrifiedChildren[0].props,
      type: arrifiedChildren[0].type,
      tag: HOST_COMPONENT,
      stateNode: createDOMElement(arrifiedChildren[0]),
      parent: fiber,
      effects: [],
      effectTag: PLACEMENT,
    };

    alternate.effectTag = DELETION;
    fiber.effects.push(alternate);

    return (fiber.child = newFiber);
  }

  if (alternate) {
    const newFiber = {
      alternate,
      props: arrifiedChildren[0].props,
      type: arrifiedChildren[0].type,
      tag: HOST_COMPONENT,
      stateNode: alternate.stateNode,
      parent: fiber,
      effects: [],
      effectTag: UPDATE,
    };

    return (fiber.child = newFiber);
  }

  // Initial render: creating the Fiber tree

  const newFiber = {
    props: arrifiedChildren[0].props,
    type: arrifiedChildren[0].type,
    tag: HOST_COMPONENT,
    stateNode: createDOMElement(arrifiedChildren[0]),
    parent: fiber,
    effects: [],
    effectTag: PLACEMENT,
  };

  fiber.child = newFiber;
}

const commitWork = (item) => {
  if (item.effectTag === UPDATE) {
    updateDOMElement(item.stateNode, item.alternate.props, item.props);

    // If there was an update but there was a type mismatch
    // stateNode had to be created.  Since it is a different instance
    // than the previous one it needs to be re-attached to the appropriate
    // DOMNode.

    if (item.parent.stateNode !== item.alternate.parent.stateNode) {
      item.parent.stateNode.appendChild(item.stateNode);
    }
  } else if (item.effectTag === DELETION) {
    item.parent.stateNode.removeChild(item.stateNode);
  } else if (item.effectTag === PLACEMENT) {
    item.parent.stateNode.appendChild(item.stateNode);
  }
};

function commitAllWork(fiber) {
  console.log(fiber);
  fiber.effects.forEach(commitWork);

  fiber.stateNode.__rootFiberContainer = fiber;
  pendingCommit = null;
}

function beginTask(fiber) {
  const children = fiber.props.children;

  reconcileChildren(fiber, children);
}

function executeSubTask(fiber) {
  beginTask(fiber);

  if (fiber.child) {
    return fiber.child;
  }

  let currentlyExecutedFiber = fiber;

  while (currentlyExecutedFiber.parent) {
    currentlyExecutedFiber.parent.effects =
      currentlyExecutedFiber.parent.effects.concat(
        currentlyExecutedFiber.effects.concat(currentlyExecutedFiber)
      );

    currentlyExecutedFiber = currentlyExecutedFiber.parent;
  }

  pendingCommit = currentlyExecutedFiber;
}

function workLoop(deadline) {
  if (!subTask) {
    subTask = getFirstSubTask();
  }

  while (subTask && deadline.timeRemaining() > ENOUGH_TIME) {
    subTask = executeSubTask(subTask);
  }

  if (pendingCommit) {
    commitAllWork(pendingCommit);
  }
}

function performTask(deadline) {
  workLoop(deadline);

  if (subTask || taskQueue.length > 0) {
    requestIdleCallback(performTask);
  }
}

export function render(element, DOMNode) {
  taskQueue.push({ dom: DOMNode, newProps: { children: element } });

  requestIdleCallback(performTask);
}
