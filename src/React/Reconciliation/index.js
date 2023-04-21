/**
 * EVENT WORK LOOP FOR LIFECYCLE EVENTS AND RENDERING.
 * FIBER NODES TO BE INITIATED/TRANSFORMED HERE.
 * THIS IS THE MAIN FIBER ALGORITHM.
 */

import {
  ENOUGH_TIME,
  CLASS_COMPONENT,
  HOST_COMPONENT,
  HOST_ROOT,
  PLACEMENT,
  UPDATE,
  DELETION,
  FUNCTIONAL_COMPONENT,
} from "./../Constants";

import {
  arrify,
  createQueue,
  requestIdleCallback,
  createStateNode,
  getTag,
  traverseToRoot,
  setWorkInProgressFiber,
} from "../Misc";

import { updateDOMElement } from "../DOM";
import { updateFunctionalComponent } from "../Hooks";

const taskQueue = createQueue();
let subTask = null;
let pendingCommit = null;

function getFirstSubTask() {
  let task = taskQueue.pop();

  if (task.from === CLASS_COMPONENT) {
    const root = traverseToRoot(task.instance);
    task.instance.__fiber.partialState = task.partialState;

    return {
      props: root.props,
      alternate: root,
      stateNode: root.stateNode,
      child: null,
      sibling: null,
      tag: HOST_ROOT,
      effects: [],
    };
  }

  if (task.from === FUNCTIONAL_COMPONENT) {
    const root = traverseToRoot({ __fiber: task.fiber });

    return {
      props: root.props,
      alternate: root,
      stateNode: root.stateNode,
      child: null,
      sibling: null,
      tag: HOST_ROOT,
      effects: [],
    };
  }

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
        parent: fiber,
        effects: [],
        effectTag: PLACEMENT,
      };

      newFiber.stateNode = createStateNode(newFiber);

      alternate.effectTag = DELETION;
      fiber.effects.push(alternate);
    } else if (element && alternate) {
      newFiber = {
        alternate,
        props: element.props,
        type: element.type,
        tag: getTag(element),
        stateNode: alternate.stateNode,
        partialState: alternate.partialState,
        parent: fiber,
        effects: [],
        effectTag: UPDATE,
        memoizedState: alternate.memoizedState,
        snapshotEffect: alternate.stateNode.getSnapshotBeforeUpdate
          ? true
          : undefined,
      };
    } else if (element && !alternate) {
      // Initial render: creating the Fiber tree

      newFiber = {
        props: element.props,
        type: element.type,
        tag: getTag(element),
        parent: fiber,
        effects: [],
        effectTag: PLACEMENT,
      };

      if (getTag(element) === FUNCTIONAL_COMPONENT) {
        newFiber.memoizedState = {
          memoizedState: undefined,
          next: undefined,
          queue: undefined,
        };
      }

      newFiber.stateNode = createStateNode(newFiber);
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

function copyChildren(fiber) {
  let alternate, prevFiber, newFiber;

  if (fiber.alternate && fiber.alternate.child) {
    alternate = fiber.alternate.child;
  }

  while (alternate) {
    newFiber = { ...alternate, alternate, parent: fiber, effects: [] };

    if (!prevFiber) {
      fiber.child = newFiber;
    } else {
      fiber.sibling = newFiber;
    }

    prevFiber = newFiber;
    alternate = alternate.sibling;
  }
}

//
//
//
// here
const commitWork = (item) => {
  if (item.tag === CLASS_COMPONENT || item.tag === FUNCTIONAL_COMPONENT) {
    // console.log(item.stateNode.__fiber);
    item.stateNode.__fiber = item;
    // console.log(item.stateNode.__fiber);
  }

  if (item.effectTag === UPDATE) {
    if (item.tag === HOST_COMPONENT || item.tag === HOST_ROOT) {
      updateDOMElement(item.stateNode, item.alternate.props, item.props);
    }

    // If there was an update but there was a type mismatch
    // stateNode had to be created.  Since it is a different instance
    // than the previous one it needs to be re-attached to the appropriate
    // DOMNode.

    if (item.parent.stateNode !== item.alternate.parent.stateNode) {
      item.parent.stateNode.appendChild(item.stateNode);
    }
  } else if (item.effectTag === DELETION) {
    let fiber = item;
    let parentFiber = item.parent;

    while (
      fiber.tag === CLASS_COMPONENT ||
      fiber.tag === FUNCTIONAL_COMPONENT
    ) {
      fiber = fiber.child;
    }

    while (
      parentFiber.tag === CLASS_COMPONENT ||
      parentFiber.tag === FUNCTIONAL_COMPONENT
    ) {
      parentFiber = parentFiber.parent;
    }

    if (parentFiber.tag === HOST_COMPONENT) {
      parentFiber.stateNode.removeChild(fiber.stateNode);
    }
  } else if (item.effectTag === PLACEMENT) {
    let fiber = item;
    let parentFiber = item.parent;

    while (
      parentFiber.tag === CLASS_COMPONENT ||
      parentFiber.tag === FUNCTIONAL_COMPONENT
    ) {
      parentFiber = parentFiber.parent;
    }

    if (fiber.tag === HOST_COMPONENT) {
      parentFiber.stateNode.appendChild(item.stateNode);
    }
  }
};

/**
 * commitAllWork is called right after Fiber is fully rendered
 */

function commitAllWork(fiber) {
  // console.log("FIBER:", fiber);

  const withSnapshot = fiber.effects.filter((effect) => effect.snapshotEffect);

  withSnapshot.forEach((effect) => {
    effect.snapshotEffect = effect.stateNode.getSnapshotBeforeUpdate(
      effect.memoizedProps,
      effect.memoizedState
    );
  });

  /**
   * Commit all the painting related work.
   */
  fiber.effects.forEach(commitWork);
  fiber.stateNode.__rootFiberContainer = fiber;
  pendingCommit = null;

  const assignRefs = fiber.effects.filter(
    (effect) =>
      effect.props.ref &&
      effect.effectTag !== FUNCTIONAL_COMPONENT &&
      (effect.effectTag === PLACEMENT || effect.effectTag === UPDATE)
  );

  const removeRefs = fiber.effects.filter(
    (effect) =>
      effect.props.ref &&
      effect.effectTag !== FUNCTIONAL_COMPONENT &&
      effect.effectTag === DELETION
  );

  assignRefs.forEach(({ props: { ref }, stateNode }) => {
    if (typeof ref === "function") {
      ref(stateNode);
    } else {
      ref.current = stateNode;
    }
  });

  removeRefs.forEach(({ props: { ref } }) => {
    if (typeof ref === "function") {
      ref(null);
    } else {
      ref.current = null;
    }
  });

  const mountEffects = fiber.effects.filter(
    (effect) => effect.effectTag === PLACEMENT && effect.tag === CLASS_COMPONENT
  );

  mountEffects.forEach((effect) => {
    effect.stateNode.componentDidMount();
  });

  const unMountEffects = fiber.effects.filter(
    (effect) => effect.effectTag === DELETION && effect.tag === CLASS_COMPONENT
  );

  unMountEffects.forEach((effect) => {
    effect.stateNode.componentWillUnmount();
  });

  const updateEffects = fiber.effects.filter(
    (effect) => effect.effectTag === UPDATE && effect.tag === CLASS_COMPONENT
  );

  updateEffects.forEach((effect) => {
    effect.stateNode.componentDidUpdate(
      effect.memoizedProps,
      effect.memoizedState,
      effect.snapshotEffect
    );
  });
}

const calculateState = (fiber) => {
  let nextState = fiber.partialState
    ? {
        ...fiber.stateNode.state,
        ...fiber.partialState,
      }
    : fiber.stateNode.state;

  fiber.partialState = null;

  const derivedState = fiber.type.getDerivedStateFromProps(
    fiber.props,
    nextState
  );

  return { ...nextState, ...derivedState };
};

function beginTask(fiber) {
  setWorkInProgressFiber(fiber);

  if (fiber.tag === CLASS_COMPONENT) {
    const nextState = calculateState(fiber);
    const shouldRender =
      fiber.effectTag === PLACEMENT
        ? true
        : fiber.stateNode.shouldComponentUpdate(fiber.props, nextState);

    if (fiber.effectTag === UPDATE) {
      fiber.memoizedState = fiber.stateNode.state;
      fiber.memoizedProps = fiber.stateNode.props;
    }

    fiber.stateNode.props = fiber.props;
    fiber.stateNode.state = nextState;

    if (shouldRender) {
      reconcileChildren(fiber, fiber.stateNode.render());
    } else {
      copyChildren(fiber);
    }
  } else if (fiber.tag === FUNCTIONAL_COMPONENT) {
    reconcileChildren(
      fiber,
      updateFunctionalComponent(() => fiber.stateNode(fiber.props))
    );
  } else if (fiber.tag === HOST_COMPONENT || fiber.tag === HOST_ROOT) {
    reconcileChildren(fiber, fiber.props.children);
  }
}

function executeSubTask(fiber) {
  beginTask(fiber);

  if (fiber.child) return fiber.child;

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

  if (pendingCommit) commitAllWork(pendingCommit);
}

function performTask(deadline) {
  workLoop(deadline);

  if (subTask || !taskQueue.isEmpty) {
    requestIdleCallback(performTask);
  }
}

export function scheduleUpdate(instance, partialState) {
  taskQueue.push({ from: CLASS_COMPONENT, instance, partialState });

  requestIdleCallback(performTask);
}

export function scheduleFunctionalUpdate(fiber) {
  taskQueue.push({ from: FUNCTIONAL_COMPONENT, fiber });

  requestIdleCallback(performTask);
}

export function render(element, DOMNode) {
  taskQueue.push({ dom: DOMNode, newProps: { children: element } });

  requestIdleCallback(performTask);
}
