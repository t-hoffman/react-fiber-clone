/**
 * UPDATING DOM NODE PROPS/STYLES/EVENTS FROM OUR "REACT" ELEMENTS
 * @param {*} prop
 * @returns
 */

// Event listeners
const isEventListener = (prop) => prop.startsWith("on");

const addEventListener = (stateNode, props) => (prop) =>
  stateNode.addEventListener(prop.substr(2).toLowerCase(), props[prop]);

const removeEventListener = (stateNode, props) => (prop) =>
  stateNode.removeEventListener(prop.substr(2).toLowerCase(), props[prop]);

// Styles
const addStyleName = (stateNode, style) => (styleName) =>
  (stateNode.style[styleName] = style[styleName]);

const removeStyleName = (stateNode, style) => (styleName) =>
  (stateNode.style[styleName] = null);

// Other prop work
const styleOrChildrenRegExp = /style|children/;

const isStyleOrChildren = (prop) => styleOrChildrenRegExp.test(prop);

const notEventStyleOrChildren = (prop) =>
  !isEventListener(prop) && !isStyleOrChildren(prop);

const copyPropsOver = (stateNode, props) => (prop) =>
  (stateNode[prop] = props[prop]);

const removeProps = (stateNode) => (prop) => (stateNode[prop] = null);

export default function (stateNode, oldProps, newProps) {
  // REMOVE OLD PROPS

  Object.keys(oldProps)
    .filter(isEventListener)
    .forEach(removeEventListener(stateNode, oldProps));

  let oldStyle = oldProps.style || {};
  Object.keys(oldStyle).forEach(removeStyleName(stateNode, oldStyle));

  Object.keys(oldProps)
    .filter(notEventStyleOrChildren)
    .forEach(removeProps(stateNode));

  // ADD NEW PROPS

  Object.keys(newProps)
    .filter(isEventListener)
    .forEach(addEventListener(stateNode, newProps));

  let style = newProps.style || {};
  Object.keys(style).forEach(addStyleName(stateNode, style));

  Object.keys(newProps)
    .filter(notEventStyleOrChildren)
    .forEach(copyPropsOver(stateNode, newProps));

  return stateNode;
}
