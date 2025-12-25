// API Configuration
const API_URL = 'https://98dxkdevuc.execute-api.eu-north-1.amazonaws.com/prod';

// Load todos when page loads
window.addEventListener('load', () => {
    loadTodos();
});

/**
 * Display error message to user
 */
function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

/**
 * Update statistics display
 */
function updateStats(todos) {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const active = total - completed;

    document.getElementById('totalCount').textContent = total;
    document.getElementById('activeCount').textContent = active;
    document.getElementById('completedCount').textContent = completed;
}

/**
 * Load all todos from API
 */
async function loadTodos() {
    const loading = document.getElementById('loading');
    const todoList = document.getElementById('todoList');
    const emptyState = document.getElementById('emptyState');

    loading.style.display = 'block';
    todoList.innerHTML = '';

    try {
        const response = await fetch(`${API_URL}/todos`);
        const data = await response.json();

        loading.style.display = 'none';

        if (data.todos && data.todos.length > 0) {
            emptyState.style.display = 'none';
            data.todos.forEach(todo => {
                addTodoToDOM(todo);
            });
            updateStats(data.todos);
        } else {
            emptyState.style.display = 'block';
            updateStats([]);
        }
    } catch (error) {
        loading.style.display = 'none';
        showError('Failed to load todos: ' + error.message);
    }
}

/**
 * Add a new todo
 */
async function addTodo() {
    const input = document.getElementById('todoInput');
    const task = input.value.trim();

    if (!task) {
        showError('Please enter a task');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                task: task, 
                completed: false 
            })
        });

        const data = await response.json();

        if (response.ok) {
            input.value = '';
            loadTodos();
        } else {
            showError('Failed to add todo: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        showError('Failed to add todo: ' + error.message);
    }
}

/**
 * Toggle todo completion status
 */
async function toggleTodo(id, completed) {
    try {
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                completed: !completed 
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to update todo');
        }

        loadTodos();

    } catch (error) {
        showError('Failed to update todo: ' + error.message);
    }
}

/**
 * Delete a todo
 */
async function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this todo?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadTodos();
        } else {
            showError('Failed to delete todo');
        }
    } catch (error) {
        showError('Failed to delete todo: ' + error.message);
    }
}

/**
 * Add todo to DOM
 */
function addTodoToDOM(todo) {
    const todoList = document.getElementById('todoList');
    const emptyState = document.getElementById('emptyState');
    
    emptyState.style.display = 'none';

    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.innerHTML = `
        <input 
            type="checkbox" 
            class="checkbox" 
            ${todo.completed ? 'checked' : ''}
            onchange="toggleTodo('${todo.id}', ${todo.completed})"
        >
        <span class="todo-text">${escapeHtml(todo.task)}</span>
        <div class="todo-actions">
            <button class="btn btn-danger" onclick="deleteTodo('${todo.id}')">Delete</button>
        </div>
    `;
    todoList.appendChild(li);
}

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}