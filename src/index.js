import React, { render } from "./React";
import { createDOMElement, updateDOMElement } from "./React/DOM";

const App = <div>Hello World!</div>;

const root = document.getElementById("root");

render(
  createDOMElement(App).appendChild(createDOMElement(App.props.children[0])),
  root
);
