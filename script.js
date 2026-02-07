// ESTADO DE LA APLICACIÓN
let todos = [];
let currentFilter = 'all';

// ELEMENTOS DEL DOM
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const clearCompletedBtn = document.getElementById('clear-completed');
const filterBtns = document.querySelectorAll('.filter-btn');

// Contadores
const countAll = document.getElementById('count-all');
const countActive = document.getElementById('count-active');
const countCompleted = document.getElementById('count-completed');

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    renderTodos();
    updateCounts();
    setupEventListeners();
});

// EVENT LISTENERS
function setupEventListeners() {
    // Agregar tarea
    todoForm.addEventListener('submit', handleAddTodo);

    // Limpiar completadas
    clearCompletedBtn.addEventListener('click', handleClearCompleted);

    // Filtros
    filterBtns.forEach(btn => {
        btn.addEventListener('click', handleFilterChange);
    });
}

// HANDLERS DE EVENTOS
function handleAddTodo(e) {
    e.preventDefault();

    const text = todoInput.value.trim();

    if (text === '') return;

    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };

    todos.push(newTodo);
    saveTodos();
    renderTodos();
    updateCounts();

    // Limpiar input con animación
    todoInput.value = '';
    todoInput.focus();

    // Feedback visual
    showNotification('Tarea agregada exitosamente');
}

function handleToggleTodo(id) {
    todos = todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );

    saveTodos();
    renderTodos();
    updateCounts();
}

function handleDeleteTodo(id) {
    const todo = todos.find(t => t.id === id);

    if (confirm(`¿Estás seguro de eliminar "${todo.text}"?`)) {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
        updateCounts();
        showNotification('Tarea eliminada');
    }
}

function handleClearCompleted() {
    const completedCount = todos.filter(todo => todo.completed).length;

    if (completedCount === 0) return;

    if (confirm(`¿Eliminar ${completedCount} tarea(s) completada(s)?`)) {
        todos = todos.filter(todo => !todo.completed);
        saveTodos();
        renderTodos();
        updateCounts();
        showNotification('Tareas completadas eliminadas');
    }
}

function handleFilterChange(e) {
    const filter = e.currentTarget.dataset.filter;
    currentFilter = filter;

    // Actualizar botones activos
    filterBtns.forEach(btn => btn.classList.remove('active'));
    e.currentTarget.classList.add('active');

    renderTodos();
}

// RENDERIZADO
function renderTodos() {
    const filteredTodos = getFilteredTodos();

    // Mostrar estado vacío si no hay tareas
    if (filteredTodos.length === 0) {
        todoList.style.display = 'none';
        emptyState.classList.add('show');
    } else {
        todoList.style.display = 'flex';
        emptyState.classList.remove('show');
    }

    // Limpiar lista
    todoList.innerHTML = '';

    // Renderizar cada tarea
    filteredTodos.forEach(todo => {
        const todoItem = createTodoElement(todo);
        todoList.appendChild(todoItem);
    });

    // Actualizar botón de limpiar
    updateClearButton();
}

function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.dataset.id = todo.id;

    li.innerHTML = `
        <input 
            type="checkbox" 
            class="todo-checkbox" 
            ${todo.completed ? 'checked' : ''}
            aria-label="Marcar como completada"
        >
        <span class="todo-text">${escapeHtml(todo.text)}</span>
        <button class="btn-delete" aria-label="Eliminar tarea">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M6 6L14 14M6 14L14 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
        </button>
    `;

    // Event listeners
    const checkbox = li.querySelector('.todo-checkbox');
    const deleteBtn = li.querySelector('.btn-delete');

    checkbox.addEventListener('change', () => handleToggleTodo(todo.id));
    deleteBtn.addEventListener('click', () => handleDeleteTodo(todo.id));

    return li;
}

// FILTRADO
function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

// ACTUALIZACIÓN DE CONTADORES
function updateCounts() {
    const total = todos.length;
    const active = todos.filter(todo => !todo.completed).length;
    const completed = todos.filter(todo => todo.completed).length;

    countAll.textContent = total;
    countActive.textContent = active;
    countCompleted.textContent = completed;
}

function updateClearButton() {
    const completedCount = todos.filter(todo => todo.completed).length;
    clearCompletedBtn.disabled = completedCount === 0;
}

// LOCAL STORAGE
function saveTodos() {
    try {
        localStorage.setItem('todos', JSON.stringify(todos));
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
        showNotification('Error al guardar las tareas', 'error');
    }
}

function loadTodos() {
    try {
        const stored = localStorage.getItem('todos');
        if (stored) {
            todos = JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error al cargar desde localStorage:', error);
        todos = [];
        showNotification('Error al cargar las tareas', 'error');
    }
}

// UTILIDADES
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'success') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Agregar animaciones de notificación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);