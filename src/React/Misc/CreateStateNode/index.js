import createReactInstance from "../createReactInstance";
import { HOST_COMPONENT } from "../../Constants";
import { createDOMElement } from "../../DOM";

export default (fiber) =>
  fiber.tag === HOST_COMPONENT
    ? createDOMElement(fiber)
    : createReactInstance(fiber);
