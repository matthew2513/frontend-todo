const form = document.querySelector("form");
const ul = document.getElementById("todo-list");

const API_URL = "https://jsonplaceholder.typicode.com/todos";

const todoListArray = [];

// Fetch todos from the API
async function fetchTodos() {
  try {
    const response = await fetch(`${API_URL}?userId=1`);

    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();

    todoListArray.push(...data);

    return todoListArray;
  } catch (error) {
    console.error("Error fetching todos:", error);
  }
}

// Function for creating list items for each todo and appends them to the ul element
function displayTodos(todoList) {
  ul.innerHTML = "";

  todoList.forEach((todo) => {
    const li = document.createElement("li");
    li.className =
      "list-group-item d-flex justify-content-between align-items-center";

    li.innerHTML = `
        <span 
          id="title-${todo.id}" 
          class="${
            todo.completed ? "text-decoration-line-through" : ""
          } cursor-pointer fw-medium fs-6" 
          onclick="toggleCompleted(${todo.id})"
        >
          ${todo.title}
        </span>
        <input 
          type="text" 
          id="input-${todo.id}" 
          value="${todo.title}" 
          class="form-control form-control-sm mt-2 me-2 d-none" 
        />
      <div class="d-flex gap-2 align-self-end align-self-md-center">
        <i 
            class="fa-solid fa-pencil text-primary cursor-pointer" 
            id="edit-btn-${todo.id}" 
            onclick="enableEdit(${todo.id})"
            title="Edit"
        ></i>
        <i 
            class="fa-solid fa-check text-success cursor-pointer d-none" 
            id="save-btn-${todo.id}" 
            onclick="updateTodo(${todo.id})"
            title="Save"
        ></i>
        <i 
            class="fa-solid fa-trash text-danger cursor-pointer" 
            onclick="deleteTodo(${todo.id})"
            title="Delete"
        ></i>
    `;

    ul.appendChild(li);
  });
}

// Event listener for form submission
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const jsonData = Object.fromEntries(formData.entries());

  if (!jsonData.title) return alert("Please enter a task.");

  jsonData.userId = 1;
  jsonData.completed = false;

  const todoId = todoListArray.length
    ? Math.max(...todoListArray.map((todo) => todo.id))
    : 0;
  jsonData.id = todoId + 1;

  console.log("Form submitted:", jsonData);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    });

    if (!response.ok) throw new Error("Network response was not ok");

    todoListArray.push(jsonData);

    displayTodos(todoListArray);

    form.reset();
  } catch (error) {
    console.error("Error submitting form:", error);
  }
});

function enableEdit(id) {
  document.getElementById(`edit-btn-${id}`).classList.add("d-none");
  document.getElementById(`save-btn-${id}`).classList.remove("d-none");

  document.getElementById(`title-${id}`).classList.add("d-none");
  document.getElementById(`input-${id}`).classList.remove("d-none");
}

// Function to update a todo (not implemented in this example)
async function updateTodo(id) {
  const input = document.getElementById(`input-${id}`);
  const newTitle = input.value;

  const todo = todoListArray.find((todo) => todo.id === id);
  if (!todo) return console.error("Todo not found");

  const updatedData = {
    title: newTitle,
    userId: todo.userId,
    completed: todo.completed,
  };

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    console.log("Todo updated:", data);

    todo.title = newTitle;

    displayTodos(todoListArray);
  } catch (error) {
    console.error("Error updating todo:", error);
  }
}

// Function to toggle the completed status of a todo
async function toggleCompleted(id) {
  const todo = todoListArray.find((t) => t.id === id);
  if (!todo) return;

  todo.completed = !todo.completed;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed: todo }),
    });

    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    console.log("Todo completed:", data.completed);

    displayTodos(todoListArray);
  } catch (error) {
    console.error("Error toggling completed status:", error);
  }
}

// Function to delete a todo
async function deleteTodo(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Network response was not ok");

    const todoIndex = todoListArray.findIndex((todo) => todo.id === id);
    if (todoIndex > -1) {
      todoListArray.splice(todoIndex, 1);
      ul.innerHTML = "";

      displayTodos(todoListArray);
    }
  } catch (error) {
    console.error("Error deleting todo:", error);
  }
}

(async function () {
  const todos = await fetchTodos();
  if (todos) displayTodos(todos);
})();
