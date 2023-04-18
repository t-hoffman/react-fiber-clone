import React, { render } from "./React";
import { createDOMElement, updateDOMElement } from "./React/DOM";

const App = (
  <section style={{ marginTop: "15px" }}>
    <section
      style={{ backgroundColor: "tomato", padding: "10px" }}
    >{`<REACT/> IS AWESOME!!`}</section>
    <section
      style={{ backgroundColor: "dodgerblue", padding: "10px" }}
    >{`<REACT/> IS AWESOME!!`}</section>
    <section
      style={{ backgroundColor: "tomato", padding: "10px" }}
    >{`<REACT/> IS AWESOME!!`}</section>
  </section>
);

const root = document.getElementById("root");

render(App, root);

const updateTypeMismatch = document.createElement("button");
const updateSameType = document.createElement("button");
const deletion = document.createElement("button");
updateTypeMismatch.innerHTML = "Typemismatch";
updateSameType.innerHTML = "Same Type";
deletion.innerHTML = "Delete";

const updateTypeMismatchFunc = () =>
  render(
    <div style={{ marginTop: "15px" }}>
      <div
        style={{ backgroundColor: "greenyellow", padding: "10px" }}
      >{`<updateTypeMismatch/>`}</div>
      <div
        style={{ backgroundColor: "greenyellow", padding: "10px" }}
      >{`<updateTypeMismatch/>`}</div>
      <div
        style={{ backgroundColor: "greenyellow", padding: "10px" }}
      >{`<updateTypeMismatch/>`}</div>
    </div>,
    root
  );
const updateSameTypeFunc = () =>
  render(
    <section style={{ marginTop: "15px" }}>
      <section
        style={{ backgroundColor: "deeppink", padding: "10px" }}
      >{`<sameType/>`}</section>
      <section
        style={{ backgroundColor: "deeppink", padding: "10px" }}
      >{`<sameType/>`}</section>
      <section
        style={{ backgroundColor: "deeppink", padding: "10px" }}
      >{`<sameType/>`}</section>
    </section>,
    root
  );
const deletionFunc = () =>
  render(
    <section style={{ marginTop: "15px" }}>
      <section
        style={{ backgroundColor: "aquamarine", padding: "10px" }}
      >{`<DELETE/>`}</section>
      <section
        style={{ backgroundColor: "aquamarine", padding: "10px" }}
      >{`<DELETE x2/>`}</section>
    </section>,
    root
  );

updateTypeMismatch.addEventListener("click", updateTypeMismatchFunc);
updateSameType.addEventListener("click", updateSameTypeFunc);
deletion.addEventListener("click", deletionFunc);
root.appendChild(updateTypeMismatch);
root.appendChild(updateSameType);
root.appendChild(deletion);
