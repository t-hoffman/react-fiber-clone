class Component {
  constructor(props) {
    this.props = props;
  }
}

class App extends Component {
  render() {
    return "hello";
  }
}

const instance = new App({ color: "green", text: "hello" });
console.log(instance);
