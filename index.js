// Create a task list item
function createTaskElement(task) {
  // Create list item
  const li = document.createElement("li");
  li.className =
    "list-group-item d-flex justify-content-between align-items-center";
  li.dataset.id = task.id;

  // Create div for checkbox and title
  const div = document.createElement("div");

  // Create checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "me-2 task-checkbox";
  checkbox.checked = task.completed;
  checkbox.dataset.id = task.id;
  checkbox.dataset.completed = task.completed;
  checkbox.addEventListener("change", () =>
    toggleTask(task.id, task.completed)
  );

  // Create title span
  const titleSpan = document.createElement("span");
  titleSpan.textContent = task.title;
  titleSpan.className = task.completed ? "completed" : "";

  // Append checkbox and title to div
  div.appendChild(checkbox);
  div.appendChild(titleSpan);

  // Create button container
  const buttonContainer = document.createElement("div");

  // Create edit button
  const editBtn = document.createElement("button");
  editBtn.className = "btn btn-warning btn-sm task-edit me-2";
  editBtn.textContent = "Edit";
  editBtn.dataset.id = task.id;
  editBtn.addEventListener("click", () =>
    startEditTask(li, task.id, task.title, div, titleSpan)
  );

  // Create delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn btn-danger btn-sm task-delete";
  deleteBtn.textContent = "Delete";
  deleteBtn.dataset.id = task.id;
  deleteBtn.addEventListener("click", () => deleteTask(task.id));

  // Append buttons to container
  buttonContainer.appendChild(editBtn);
  buttonContainer.appendChild(deleteBtn);

  // Append div and button container to list item
  li.appendChild(div);
  li.appendChild(buttonContainer);

  return li;
}

// Fetch and display tasks (initial load only)
async function fetchTasks() {
  try {
    const response = await fetch("http://localhost:3000/tasks");
    if (!response.ok) throw new Error("Failed to fetch tasks");
    const tasks = await response.json();
    const taskList = document.getElementById("taskList");
    // Clear the task list
    while (taskList.firstChild) {
      taskList.removeChild(taskList.firstChild);
    }
    tasks.forEach((task) => {
      console.log("Task:", task); // Debug task data
      taskList.appendChild(createTaskElement(task));
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
}

// Start editing a task
function startEditTask(li, id, currentTitle, div, titleSpan) {
  // Remove existing title span
  div.removeChild(titleSpan);

  // Create edit input
  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "form-control edit-input";
  editInput.value = currentTitle;

  // Create save button
  const saveBtn = document.createElement("button");
  saveBtn.className = "btn btn-success btn-sm me-2";
  saveBtn.textContent = "Save";
  saveBtn.addEventListener("click", () =>
    saveTask(id, editInput.value, li, div, editInput, saveBtn, cancelBtn)
  );

  // Create cancel button
  const cancelBtn = document.createElement("button");
  cancelBtn.className = "btn btn-secondary btn-sm";
  cancelBtn.textContent = "Cancel";
  cancelBtn.addEventListener("click", () =>
    cancelEdit(li, currentTitle, div, editInput, saveBtn, cancelBtn)
  );

  // Handle Enter and Escape keys
  editInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      saveTask(id, editInput.value, li, div, editInput, saveBtn, cancelBtn);
    } else if (e.key === "Escape") {
      cancelEdit(li, currentTitle, div, editInput, saveBtn, cancelBtn);
    }
  });

  // Append input and buttons to div
  div.appendChild(editInput);
  div.appendChild(saveBtn);
  div.appendChild(cancelBtn);

  // Focus the input
  editInput.focus();
}

// Save edited task
async function saveTask(id, newTitle, li, div, editInput, saveBtn, cancelBtn) {
  const trimmedTitle = newTitle.trim();
  if (!trimmedTitle) return;

  try {
    const response = await fetch(`http://localhost:3000/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmedTitle }),
    });
    if (!response.ok) throw new Error("Failed to update task");
    const updatedTask = await response.json();
    // Update DOM
    div.removeChild(editInput);
    div.removeChild(saveBtn);
    div.removeChild(cancelBtn);
    const titleSpan = document.createElement("span");
    titleSpan.textContent = updatedTask.title;
    titleSpan.className = updatedTask.completed ? "completed" : "";
    div.appendChild(titleSpan);
  } catch (error) {
    console.error("Error updating task:", error);
    fetchTasks(); // Fallback to full refresh
  }
}

// Cancel edit
function cancelEdit(li, originalTitle, div, editInput, saveBtn, cancelBtn) {
  // Remove edit input and buttons
  div.removeChild(editInput);
  div.removeChild(saveBtn);
  div.removeChild(cancelBtn);

  // Restore original title
  const titleSpan = document.createElement("span");
  titleSpan.textContent = originalTitle;
  titleSpan.className = li.querySelector(".task-checkbox").checked
    ? "completed"
    : "";
  div.appendChild(titleSpan);
}

// Add a new task
async function addTask() {
  const taskInput = document.getElementById("taskInput");
  const title = taskInput.value.trim();
  if (!title) return;

  try {
    const newTask = { title, completed: false };
    const response = await fetch("http://localhost:3000/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });
    if (!response.ok) throw new Error("Failed to add task");
    const createdTask = await response.json();
    taskInput.value = "";
    // Append new task to DOM
    const taskList = document.getElementById("taskList");
    taskList.appendChild(createTaskElement(createdTask));
  } catch (error) {
    console.error("Error adding task:", error);
    fetchTasks(); // Fallback to full refresh
  }
}

// Toggle task completion
async function toggleTask(id, completed) {
  try {
    const response = await fetch(`http://localhost:3000/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    });
    if (!response.ok) throw new Error("Failed to toggle task");
    const updatedTask = await response.json();
    // Update DOM
    const li = document.querySelector(`li[data-id="${id}"]`);
    const checkbox = li.querySelector(".task-checkbox");
    const titleSpan = li.querySelector("span");
    checkbox.checked = updatedTask.completed;
    checkbox.dataset.completed = updatedTask.completed;
    titleSpan.className = updatedTask.completed ? "completed" : "";
  } catch (error) {
    console.error("Error toggling task:", error);
    fetchTasks(); // Fallback to full refresh
  }
}

// Delete a task
async function deleteTask(id) {
  try {
    const response = await fetch(`http://localhost:3000/tasks/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete task");
    // Remove task from DOM
    const li = document.querySelector(`li[data-id="${id}"]`);
    li.remove();
  } catch (error) {
    console.error("Error deleting task:", error);
    fetchTasks(); // Fallback to full refresh
  }
}

// Initialize event listeners
document.getElementById("addTaskBtn").addEventListener("click", addTask);
document.getElementById("taskInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addTask();
  }
});

// Initial fetch
fetchTasks();
