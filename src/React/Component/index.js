import { scheduleUpdate } from "../Reconciliation";

export class Component {
  constructor(props) {
    this.props = props;
    this.state = this.state || {};
  }

  shouldComponentUpdate() {
    return true;
  }

  componentDidMount() {}

  componentDidUpdate() {}

  componentWillUnmount() {}

  static getDerivedStateFromProps() {}

  setState(partialState) {
    scheduleUpdate(this, partialState);
  }
}
