/**
 * BABEL COMPILER TO TRANSFORM JSX TO "REACT" ELEMENTS
 */

const TEXT_ELEMENT = "TEXT_ELEMENT";

function createTextElement(nodeValue) {
  return createElement(TEXT_ELEMENT, { nodeValue });
}

export default function createElement(type, config, ...args) {
  const props = Object.assign({}, config);
  const hasChildren = args.length > 0;

  // typeof args[0] === "function" && (args[0] = args[0]());
  if (typeof args[0] === "function") {
    props.children = args[0];
    return { type, props };
  }

  const rawChildren = hasChildren ? [...args] : [];
  props.children = rawChildren
    .filter((c) => c !== null && c !== false)
    .map((c) => (c instanceof Object ? c : createTextElement(c)));

  return { type, props };
}
