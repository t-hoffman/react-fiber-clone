/**
 * CREATING DOM NODES FROM OUR "REACT" ELEMENTS
 * @param {*} element
 * @returns
 */

import updateDOMElement from "./updateDOMElement";

export default function (element) {
  const { type, props } = element;

  if (type === "TEXT_ELEMENT") {
    return document.createTextNode(props.nodeValue);
  }

  let domNode = document.createElement(type);

  return updateDOMElement(domNode, {}, props);
}
