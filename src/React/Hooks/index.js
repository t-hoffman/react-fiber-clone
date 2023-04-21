import { getWorkInProgressFiber, clearWorkInProgressFiber } from "../Misc";
import { scheduleFunctionalUpdate } from "../Reconciliation";

let currentFiber, currentHook;

function getNextHook() {
  if (!currentHook) {
    currentHook = currentFiber.memoizedState;
  } else {
    if (!currentHook.next) {
      currentHook.next = {
        memoizedState: undefined,
        next: undefined,
        queue: undefined,
      };
    }

    currentHook = currentHook.next;
  }
}

function prepareHooks() {
  currentFiber = getWorkInProgressFiber();
}

function cleanHooks() {
  currentFiber = null;
  currentHook = null;

  clearWorkInProgressFiber();
}

export function updateFunctionalComponent(fn) {
  prepareHooks();

  const elements = fn();

  cleanHooks();

  return elements;
}

function rawSetter(currentHook, fiber) {
  return (value) => {
    currentHook.queue.push(value);

    scheduleFunctionalUpdate(fiber);
  };
}

export function useState(initialState) {
  getNextHook();
  console.log(currentHook);

  if (!currentHook.queue) {
    currentHook.memoizedState = initialState;
    currentHook.queue = [initialState];
  } else {
    currentHook.memoizedState = currentHook.queue[currentHook.queue.length - 1];
  }

  const value = currentHook.memoizedState;
  const setter = rawSetter(currentHook, currentFiber);

  return [value, setter];
}
