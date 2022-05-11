export const createTodoStore = (localStorageKey) => {
    'use strict';

    let todos = [];
    const eventTarget = new EventTarget();
    readStorage();

    // handle if todos are edited in another window
    window.addEventListener("storage", () => {
        readStorage();
        save();
    }, false);

    function readStorage() {
        todos = JSON.parse(window.localStorage.getItem(localStorageKey) || '[]');
    }

    function save() {
        window.localStorage.setItem(localStorageKey, JSON.stringify(todos));
        eventTarget.dispatchEvent(new CustomEvent('save'));
    }

    function all(viewFilter) {
        switch (viewFilter) {
            case 'active': return todos.filter(todo => !todo.completed);
            case 'completed': return todos.filter(todo => todo.completed);
            default: return todos;
        }
    }

    function hasCompleted() {
        return todos.some(todo => todo.completed);
    }

    function isAllCompleted() {
        return todos.every(todo => todo.completed);
    }

    function add(todo) {
        todos.push({ title: todo.title, completed: false, id: "id_" + Date.now() });
        save();
    }

    function remove({ id }) {
        todos = todos.filter(todo => todo.id !== id);
        save();
    }

    function toggle({ id }) {
        todos = todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo);
        save();
    }

    function clearCompleted() {
        todos = todos.filter(todo => !todo.completed);
        save();
    }

    function update(todo) {
        todos = todos.map(t => t.id === todo.id ? todo : t);
        save();
    }

    function toggleAll() {
        const completed = !hasCompleted() || !isAllCompleted();
        todos = todos.map(todo => ({ ...todo, completed }));
        save();
    }

    return {
        all, add, remove, toggle, hasCompleted, isAllCompleted, clearCompleted, update, toggleAll,
        addEventListener: eventTarget.addEventListener.bind(eventTarget)
    }
}
