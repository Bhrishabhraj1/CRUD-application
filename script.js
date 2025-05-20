/**
 * Task Manager CRUD Application
 * A complete task management solution with localStorage persistence
 * Features: Create, Read, Update, Delete, Search, and Complete tasks
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');
    const searchInput = document.getElementById('searchInput');
    const emptyState = document.getElementById('emptyState');
    const editModal = document.getElementById('editModal');
    const editTaskInput = document.getElementById('editTaskInput');
    const saveEditBtn = document.getElementById('saveEditBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');

    // Application State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentEditIndex = null;

    // Initialize the application
    function init() {
        renderTasks();
        setupEventListeners();
        checkEmptyState();
    }

    // Set up all event listeners
    function setupEventListeners() {
        // Add task events
        addBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addTask();
        });

        // Search/filter event
        searchInput.addEventListener('input', filterTasks);

        // Modal events
        saveEditBtn.addEventListener('click', saveEditedTask);
        cancelEditBtn.addEventListener('click', closeEditModal);

        // Click outside modal to close
        window.addEventListener('click', function(event) {
            if (event.target === editModal) {
                closeEditModal();
            }
        });
    }

    // Render tasks to the DOM
    function renderTasks(tasksToRender = tasks) {
        taskList.innerHTML = '';
        
        if (tasksToRender.length === 0) {
            emptyState.hidden = false;
            return;
        } else {
            emptyState.hidden = true;
        }

        tasksToRender.forEach((task, index) => {
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskItem.setAttribute('data-task-id', index);
            
            taskItem.innerHTML = `
                <div class="task-content">
                    <span class="task-text">${escapeHtml(task.text)}</span>
                    <span class="task-date">${new Date(task.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
                <div class="task-actions">
                    <button class="complete-btn" aria-label="${task.completed ? 'Mark as incomplete' : 'Mark as complete'}">
                        ${task.completed ? '↩ Undo' : '✓ Complete'}
                    </button>
                    <button class="edit-btn" aria-label="Edit task">✎ Edit</button>
                    <button class="delete-btn" aria-label="Delete task">🗑 Delete</button>
                </div>
            `;
            
            taskList.appendChild(taskItem);
            
            // Add event listeners to task buttons
            taskItem.querySelector('.complete-btn').addEventListener('click', () => toggleComplete(index));
            taskItem.querySelector('.edit-btn').addEventListener('click', () => openEditModal(index));
            taskItem.querySelector('.delete-btn').addEventListener('click', () => deleteTask(index));
        });
    }

    // Add a new task
    function addTask() {
        const text = taskInput.value.trim();
        if (text) {
            tasks.push({
                text,
                completed: false,
                createdAt: Date.now(),
                lastModified: Date.now()
            });
            saveTasks();
            taskInput.value = '';
            renderTasks();
            checkEmptyState();
        }
    }

    // Toggle task completion status
    function toggleComplete(index) {
        tasks[index].completed = !tasks[index].completed;
        tasks[index].lastModified = Date.now();
        saveTasks();
        renderTasks();
    }

    // Open edit modal
    function openEditModal(index) {
        currentEditIndex = index;
        editTaskInput.value = tasks[index].text;
        editModal.hidden = false;
        editTaskInput.focus();
    }

    // Close edit modal
    function closeEditModal() {
        editModal.hidden = true;
        currentEditIndex = null;
    }

    // Save edited task
    function saveEditedTask() {
        if (currentEditIndex !== null) {
            const newText = editTaskInput.value.trim();
            if (newText) {
                tasks[currentEditIndex].text = newText;
                tasks[currentEditIndex].lastModified = Date.now();
                saveTasks();
                renderTasks();
                closeEditModal();
            }
        }
    }

    // Delete task
    function deleteTask(index) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
            checkEmptyState();
        }
    }

    // Filter tasks
    function filterTasks() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredTasks = tasks.filter(task => 
            task.text.toLowerCase().includes(searchTerm)
        );
        renderTasks(filteredTasks);
    }

    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Check if task list is empty
    function checkEmptyState() {
        emptyState.hidden = tasks.length > 0;
    }

    // Basic HTML escaping for security
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Initialize the app
    init();
});