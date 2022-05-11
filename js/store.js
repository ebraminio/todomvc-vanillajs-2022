export const createTodoStore = localStorageKey => {
    'use strict';
    let todos = [];
    const callbacks = [];
    readStorage();

    // handle if todos are edited in another window
    window.addEventListener('storage', () => {
        readStorage();
        save();
    }, false);

    function readStorage() {
        todos = JSON.parse(window.localStorage.getItem(localStorageKey) || '[]');
    }

    function save() {
        window.localStorage.setItem(localStorageKey, JSON.stringify(todos));
		callbacks.forEach(callback => callback());
    }

    return {
        all(viewFilter) {
            switch (viewFilter) {
                case 'active': return todos.filter(todo => !todo.completed);
                case 'completed': return todos.filter(todo => todo.completed);
                default: return todos;
            }
        },
        isAllCompleted: () => todos.every(todo => todo.completed),
        hasCompleted: () => todos.some(todo => todo.completed),
        add(todo) {
            todos.push({ title: todo.title, completed: false, id: "id_" + Date.now() });
            save();
        },
        remove({ id }) {
            todos = todos.filter(todo => todo.id !== id);
            save();
        },
        toggle({ id }) {
            todos = todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo);
            save();
        },
        clearCompleted() {
            todos = todos.filter(todo => !todo.completed);
            save();
        },
        update(todo) {
            todos = todos.map(t => t.id === todo.id ? todo : t);
            save();
        },
        toggleAll() {
            const completed = !hasCompleted() || !isAllCompleted();
            todos = todos.map(todo => ({ ...todo, completed }));
            save();
        },
        subscribe: callback => {
            callback();
            callbacks.push(callback);
        }
    }
}
