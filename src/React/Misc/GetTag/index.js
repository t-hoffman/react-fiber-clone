import { Component } from "../../Component";
import {
  CLASS_COMPONENT,
  FUNCTIONAL_COMPONENT,
  HOST_COMPONENT,
} from "../../Constants";

export default (element) => {
  const instanceOfComponent = Object.getPrototypeOf(element.type) === Component;

  return typeof element.type === "string"
    ? HOST_COMPONENT
    : instanceOfComponent
    ? CLASS_COMPONENT
    : FUNCTIONAL_COMPONENT;
};
