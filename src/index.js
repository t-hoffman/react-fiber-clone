import React, { render, Component, createRef, useState } from "./React";

class Todos extends Component {
  render() {
    return this.props.todos.map((todo, idx) => (
      <div
        key={todo.id}
        style={{ display: "flex", justifyContent: "space-around" }}
      >
        <div
          style={{
            textDecoration: todo.completed ? "line-through" : "none",
            flexGrow: 1,
          }}
        >
          {todo.name}
        </div>
        <button onClick={() => this.props.toggle(todo)}>
          {todo.completed ? `Undone` : `Done`}
        </button>
        <button
          onClick={() => {
            const { [idx]: remove, ...keep } = this.props.todos;
            this.props.change(Object.values(keep));
          }}
        >
          Delete
        </button>
      </div>
    ));
  }
}

class CreateTodo extends Component {
  constructor(props) {
    super(props);

    this.state = { input: "" };
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    return { snappyshot: "hello world" };
  }

  componentDidUpdate(prevProps, prevState, snapShot) {
    console.log(prevProps);
    console.log(prevState);
    console.log(snapShot);
  }

  render() {
    return (
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            flexDirection: "column",
            width: "40%",
          }}
        >
          <input
            value={this.state.input}
            onInput={(e) => this.setState({ input: e.target.value })}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              padding: "5px",
              borderRadius: "5px",
            }}
          />
          <button
            onClick={() => {
              if (this.state.input) {
                this.props.onTodoCreation({
                  name: this.state.input,
                  completed: false,
                  id: Math.round(Math.random() * 10000, 2),
                });

                this.setState({ input: "" });
              }
            }}
            style={{
              width: "fit-content",
              margin: "5px 0 0 auto",
              backgroundColor: "crimson",
              border: "none",
              outline: "none",
              padding: "10px",
              borderRadius: "10px",
            }}
          >
            <b>Create todo</b>
          </button>
        </div>
      </div>
    );
  }
}

const Counter = () => {
  const [count, setCount] = useState(0);
  const [greeting, setGreeting] = useState("<COUNTER/>");

  return (
    <div>
      <div
        style={{
          padding: "15px",
          backgroundColor: "greenyellow",
          margin: "10px 0",
        }}
      >
        <span
          style={{ backgroundColor: "black", padding: "3px", color: "white" }}
        >
          <b>{greeting}</b>
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ padding: "10px" }}>
          <span style={{ fontSize: "18pt" }}>{count}</span>
        </div>
        <div>
          <button onClick={() => setCount(count + 1)}>+</button>
          <button onClick={() => setGreeting("<TYLER/>")}>GREET</button>
        </div>
      </div>
    </div>
  );
};

class Todo extends Component {
  constructor(props) {
    super(props);

    this.ref = createRef();

    this.state = {
      todos: [
        {
          completed: false,
          id: 1,
          name: "Where did I go wrong?",
        },
        {
          completed: false,
          id: 2,
          name: "Make coffee!",
        },
        {
          completed: false,
          id: 3,
          name: "Clean the house",
        },
      ],
      visible: true,
    };

    this.handleTodoAppend = this.handleTodoAppend.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleToggle(todo) {
    const copy = [...this.state.todos];

    const index = copy.findIndex((t) => t.id === todo.id);

    copy[index] = { ...copy[index], completed: !copy[index].completed };

    this.setState({ todos: copy });
  }

  handleTodoAppend(todo) {
    this.setState({ todos: [...this.state.todos, todo] });
  }

  handleChange(todos) {
    this.setState({ todos });
  }

  static getDerivedStateFromProps(props, state) {
    if (props.nullify) {
      return { todos: [] };
    }

    return { ...state };
  }

  componentDidMount() {
    console.log(this.ref.current);
  }

  render() {
    return (
      <div>
        <div style={{ padding: "15px", backgroundColor: "greenyellow" }}>
          <span
            style={{ backgroundColor: "black", padding: "3px", color: "white" }}
          >
            <b ref={this.ref}>{`<TODOS/>`}</b>
          </span>
        </div>
        <section style={{ padding: "5px" }}>
          <Todos
            todos={this.state.todos}
            toggle={this.handleToggle}
            change={this.handleChange}
          />
        </section>
        <CreateTodo onTodoCreation={this.handleTodoAppend} />
        <Counter />
      </div>
    );
  }
}

const root = document.getElementById("root");

render(<Todo nullify={false} />, root);
