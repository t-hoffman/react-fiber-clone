let inProgressFiber = null;

export function setWorkInProgressFiber(fiber) {
  inProgressFiber = fiber;
}

export function getWorkInProgressFiber() {
  return inProgressFiber;
}

export function clearWorkInProgressFiber() {
  inProgressFiber = null;
}
