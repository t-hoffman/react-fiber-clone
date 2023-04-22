import { NO_EFFECT, PASSIVE_EFFECT } from "../Constants";
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
    const newState =
      typeof value === "function" ? value(currentHook.memoizedState) : value;

    currentHook.queue.push(newState);

    scheduleFunctionalUpdate(fiber);
  };
}

export function useState(initialState) {
  getNextHook();

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

function isInputDifferent(input, prevInput) {
  let index = 0,
    alreadyDifferent = false;

  if (!prevInput) {
    return true;
  }

  if (Array.isArray(input) && input.length === 0) {
    return false;
  }

  while (index < input.length && !alreadyDifferent) {
    if (input[index] !== prevInput[index]) {
      alreadyDifferent = true;
    }

    index++;
  }

  return alreadyDifferent;
}

export function useEffect(create, input) {
  getNextHook();

  let prevEffect, prevInput;

  if (!currentHook.queue) {
    currentHook.memoizedState = {
      create,
      destroy: null,
      input,
      effect: PASSIVE_EFFECT,
    };

    currentHook.queue = [currentHook.memoizedState];
  } else {
    prevEffect = currentHook.memoizedState;
    prevInput = prevEffect.input;
    currentHook.memoizedState = {
      create,
      destroy: prevEffect.destroy,
      input,
      effect: PASSIVE_EFFECT,
    };

    currentHook.queue.push(currentHook.memoizedState);
  }

  if (!isInputDifferent(input, prevInput)) {
    currentHook.memoizedState.effect = NO_EFFECT;
  }

  currentFiber.updateQueue.push(currentHook.memoizedState);
}
