import React, { render } from "./React";
import { createDOMElement, updateDOMElement } from "./React/DOM";

const App = (
  <ul>
    <li>
      <button onClick={() => console.log("hello")}>BUTTON</button>
    </li>
  </ul>
);

const root = document.getElementById("root");

render(App, root);

const btn = document.createElement("button");
btn.innerHTML = "Manually rerender!";

const rerender = () =>
  render(
    <ul>
      <li>
        <i>Hey</i>
      </li>
    </ul>,
    root
  );

btn.addEventListener("click", rerender);
root.appendChild(btn);
