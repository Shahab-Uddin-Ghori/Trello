/////////////////////////////// Unchangeable Elements ///////////////////////////////////////

// Select the body and set initial styles
const body = document.querySelector("body");
body.style = "padding:0;margin:0;box-sizing: border-box;font-family: sans-serif;background-color: antiquewhite;";

// Create and style the header
const createHeader = () => {
  const h1 = document.createElement("h1");
  h1.innerText = "Trello";
  h1.style = "background-color:rgba(1, 9, 13, 0.909);margin:0 0 1rem;padding:.5rem;text-align:center;color:#fff;letter-spacing:2px";
  body.prepend(h1);
};

// Create and style the main container
const mainDiv = document.createElement("div");
mainDiv.style = "display: flex;overflow: auto;gap:1rem;padding:1rem;align-items:flex-start";
body.append(mainDiv);

// Create input for column name and the button for creating a new column
const createInputAndButton = () => {
  const columnInput = document.createElement("input");
  columnInput.style = "width:20rem;height:2rem;border-radius: 4px;border: none;outline: none;text-align:center;margin:1rem;";
  columnInput.placeholder = "Enter New Column Name";
  columnInput.required = true;

  const divCreateButton = document.createElement("button");
  divCreateButton.innerText = "Create new Column";
  divCreateButton.style = "min-width:12rem;height:2rem;border-radius: 4px;margin-top:1rem;";
  divCreateButton.addEventListener("click", (event) => {
    event.preventDefault();
    if (columnInput.value.trim() !== "") {
      createAndAppendColumn(columnInput.value);
      columnInput.value = "";
    } else {
      columnInput.required = true;
    }
  });

  body.append(divCreateButton);
  divCreateButton.before(columnInput);
};

//////////////////////////// Unchangeable Element End ////////////////////////////////////////////////////////

//////////////////// Column Create Function and task create function by event listener ///////////////////////

// Helper function to create a task element
const createTaskElement = (taskValue, columnName) => {
  const task = document.createElement("p");
  task.innerText = taskValue;
  task.style = "width:15rem;height:1.5rem;border-radius: 4px;border: none;outline: none;text-align:center;background-color:#fff;display:flex;flex-direction:column;justify-content: center;align-items: center";
  task.draggable = true;
  task.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("text/plain", task.innerText);
    event.dataTransfer.setData("sourceColumn", columnName);
  });
  return task;
};

// Function to handle task drop
const handleTaskDrop = (event, columnName) => {
  event.preventDefault();
  const taskValue = event.dataTransfer.getData("text/plain");
  const sourceColumnName = event.dataTransfer.getData("sourceColumn");

  const task = createTaskElement(taskValue, columnName);
  event.target.closest("div").querySelector("h2").after(task);

  // Remove task from source column in local storage and DOM
  const sourceTasks = JSON.parse(localStorage.getItem(sourceColumnName)) || [];
  localStorage.setItem(sourceColumnName, JSON.stringify(sourceTasks.filter(task => task !== taskValue)));
  const sourceDiv = Array.from(mainDiv.children).find(div => div.querySelector("h2").innerText === sourceColumnName);
  Array.from(sourceDiv.querySelectorAll("p")).forEach(p => {
    if (p.innerText === taskValue) p.remove();
  });

  // Add task to the new column in local storage
  const targetTasks = JSON.parse(localStorage.getItem(columnName)) || [];
  targetTasks.push(taskValue);
  localStorage.setItem(columnName, JSON.stringify(targetTasks));
};

// Function to create a new column div
const createColumn = (columnName = "ToDo") => {
  const div = document.createElement("div");
  const h2 = document.createElement("h2");
  const form = document.createElement("form");
  const input = document.createElement("input");
  const button = document.createElement("button");

  // Set text and attributes
  h2.innerText = columnName;
  button.innerText = "Add Task";
  input.required = true;
  input.placeholder = "Enter new task";
  input.type = "text";

  // Set styles
  div.style = "min-width:25%;background-color:aqua;display:flex;flex-direction:column;justify-content: flex-start;align-items: center;border: 2px solid rgba(42, 42, 255, 0.903);padding:.5rem;border-radius:7px;";
  form.style = "display: flex;flex-direction: column;align-items: center;gap: .5rem";
  input.style = "width:15rem;height:1.5rem;border-radius: 4px;border: none;outline: none;text-align:center;";
  button.style = "min-width:8rem;height:1.5rem;border-radius: 4px;";

  // Append elements
  div.append(h2, form);
  form.append(input, button);

  // Make column a drop zone
  div.addEventListener("dragover", (event) => event.preventDefault());
  div.addEventListener("drop", (event) => handleTaskDrop(event, columnName));

  // Form submission event listener
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const task = createTaskElement(input.value, columnName);
    h2.after(task);

    // Save task in local storage
    const tasks = JSON.parse(localStorage.getItem(columnName)) || [];
    tasks.push(input.value);
    localStorage.setItem(columnName, JSON.stringify(tasks));

    form.reset();
  });

  return div;
};

// Function to create and append column
const createAndAppendColumn = (columnName) => {
  const column = createColumn(columnName);
  mainDiv.append(column);

  if (!localStorage.getItem(columnName)) {
    localStorage.setItem(columnName, JSON.stringify([]));
  }

  const columnOrder = JSON.parse(localStorage.getItem("columnOrder")) || [];
  columnOrder.push(columnName);
  localStorage.setItem("columnOrder", JSON.stringify(columnOrder));
};

// Load columns and tasks from local storage on page load
window.addEventListener("load", () => {
  const columnOrder = JSON.parse(localStorage.getItem("columnOrder")) || [];
  columnOrder.forEach(columnName => {
    const column = createColumn(columnName);
    mainDiv.append(column);
    const h2 = column.querySelector("h2");
    const tasks = JSON.parse(localStorage.getItem(columnName)) || [];
    tasks.forEach(taskValue => h2.after(createTaskElement(taskValue, columnName)));
  });

  if (!columnOrder.includes("ToDo")) {
    createAndAppendColumn("ToDo");
  }
});

// Initial setup
createHeader();
createInputAndButton();
