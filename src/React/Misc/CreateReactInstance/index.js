import { CLASS_COMPONENT } from "../../Constants";

export default (fiber) => {
  let instance;

  if (fiber.tag === CLASS_COMPONENT) {
    instance = new fiber.type(fiber.props);
  } else {
    instance = function (props) {
      return fiber.type(props);
    };
    // instance = fiber.type;
  }

  instance.__fiber = fiber;

  return instance;
};
