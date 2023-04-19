import React, { render, Component } from "./React";

const Todos = (props) =>
  props.todos.map((todo) => (
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
      <button onClick={() => props.toggle(todo)}>
        {todo.completed ? `Mark it undone` : `Mark it complete`}
      </button>
    </div>
  ));

class CreateTodo extends Component {
  constructor(props) {
    super(props);

    this.state = { input: "" };
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
            onChange={(e) => this.setState({ input: e.target.value })}
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
              this.props.onTodoCreation({
                name: this.state.input,
                completed: false,
                id: Math.round(Math.random() * 10000, 2),
              });
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

class Todo extends Component {
  constructor(props) {
    super(props);

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
    };

    this.handleTodoAppend = this.handleTodoAppend.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
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

  render() {
    return (
      <div>
        <div style={{ padding: "15px", backgroundColor: "greenyellow" }}>
          <span
            style={{ backgroundColor: "black", padding: "3px", color: "white" }}
          >
            <b>{`<TODOS/>`}</b>
          </span>
        </div>
        <section style={{ padding: "5px" }}>
          <Todos todos={this.state.todos} toggle={this.handleToggle} />
        </section>
        <CreateTodo onTodoCreation={this.handleTodoAppend} />
      </div>
    );
  }
}

const root = document.getElementById("root");

render(<Todo />, root);
