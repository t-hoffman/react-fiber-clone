import React, { render, Component } from "./React";
import { createDOMElement, updateDOMElement } from "./React/DOM";

class Title extends Component {
  render() {
    return (
      <span
        style={{
          backgroundColor: this.props.color,
          padding: "4px",
          color: "white",
          marginRight: "3px",
        }}
      >
        <b>{this.props.title}</b>
      </span>
    );
  }
}

class Container extends Component {
  render() {
    return (
      <div style={{ padding: "15px", backgroundColor: this.props.color }}>
        <Title title="<REACT/>" color="black" />
        {this.props.text}
      </div>
    );
  }
}

class App extends Component {
  render() {
    return <Container color="greenyellow" text="IS AWESOME!! <<<" />;
  }
}

const root = document.getElementById("root");

render(<App />, root);
