/**
 * EVENT WORK LOOP FOR LIFECYCLE EVENTS AND RENDERING.
 * FIBER NODES TO BE INITIATED/TRANSFORMED HERE.
 * THIS IS THE MAIN FIBER ALGORITHM.
 */

import {
  arrify,
  createQueue,
  requestIdleCallback,
  createReactInstance,
} from "../Misc";

import {
  ENOUGH_TIME,
  CLASS_COMPONENT,
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
    child: null,
    sibling: null,
    tag: HOST_ROOT,
    effects: [],
  };
}

const createStateNode = (element, tag) =>
  tag === HOST_COMPONENT
    ? createDOMElement(element)
    : tag === CLASS_COMPONENT
    ? createReactInstance(element)
    : createDOMElement(element);

const getTag = (element) =>
  typeof element.type === "string" ? HOST_COMPONENT : CLASS_COMPONENT;

function reconcileChildren(fiber, children) {
  const arrifiedChildren = arrify(children);

  let index = 0;
  let numberOfElements = arrifiedChildren.length;
  let element, alternate, prevFiber, newFiber;

  if (fiber.alternate && fiber.alternate.child) {
    alternate = fiber.alternate.child;
  }

  while (index < numberOfElements || alternate) {
    element = arrifiedChildren[index];
    if (!element && alternate) {
      // If there is an alternate while there is no current element
      // that means the DOMNode got deleted.

      alternate.effectTag = DELETION;
      fiber.effects.push(alternate);
    } else if (element && alternate && element.type !== alternate.type) {
      newFiber = {
        alternate,
        props: element.props,
        type: element.type,
        tag: getTag(element),
        stateNode: createStateNode(element, getTag(element)),
        parent: fiber,
        effects: [],
        effectTag: PLACEMENT,
      };

      alternate.effectTag = DELETION;
      fiber.effects.push(alternate);
    } else if (element && alternate) {
      newFiber = {
        alternate,
        props: element.props,
        type: element.type,
        tag: getTag(element),
        stateNode: alternate.stateNode,
        parent: fiber,
        effects: [],
        effectTag: UPDATE,
      };
    } else if (element && !alternate) {
      // Initial render: creating the Fiber tree

      newFiber = {
        props: element.props,
        type: element.type,
        tag: getTag(element),
        stateNode: createStateNode(element, getTag(element)),
        parent: fiber,
        effects: [],
        effectTag: PLACEMENT,
      };
    }

    if (index === 0) {
      fiber.child = newFiber;
    } else if (element) {
      prevFiber.sibling = newFiber;
    }

    if (alternate && alternate.sibling) {
      alternate = alternate.sibling;
    } else {
      alternate = null;
    }

    prevFiber = newFiber;
    index++;
  }
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
    let fiber = item;
    let parentFiber = item.parent;
    while (parentFiber.tag === CLASS_COMPONENT) {
      parentFiber = parentFiber.parent;
    }

    if (fiber.tag === HOST_COMPONENT) {
      parentFiber.stateNode.appendChild(item.stateNode);
    }
  }
};

function commitAllWork(fiber) {
  console.log(fiber);
  fiber.effects.forEach(commitWork);

  fiber.stateNode.__rootFiberContainer = fiber;
  pendingCommit = null;
}

function beginTask(fiber) {
  if (fiber.tag === CLASS_COMPONENT) {
    reconcileChildren(fiber, fiber.stateNode.render());
  } else if (fiber.tag === HOST_COMPONENT || fiber.tag === HOST_ROOT) {
    reconcileChildren(fiber, fiber.props.children);
  }
}

function executeSubTask(fiber) {
  beginTask(fiber);

  if (fiber.child || fiber.sibling) {
    return fiber.child ? fiber.child : fiber.child;
  }

  let currentlyExecutedFiber = fiber;

  while (currentlyExecutedFiber.parent) {
    currentlyExecutedFiber.parent.effects =
      currentlyExecutedFiber.parent.effects.concat(
        currentlyExecutedFiber.effects.concat(currentlyExecutedFiber)
      );

    if (currentlyExecutedFiber.sibling) {
      return currentlyExecutedFiber.sibling;
    }

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
