import { addEvent, getURLHash } from './helpers.js';
import { createTodoStore } from './store.js';

const todoStore = createTodoStore('todo-vanillajs-2022');

const createApp = rootElement => {
	'use strict';

	const $input = rootElement.querySelector('.new-todo');
	const $list = rootElement.querySelector('.todo-list');
	const $count = rootElement.querySelector('.todo-count');
	const $footer = rootElement.querySelector('.footer');
	const $toggleAll = rootElement.querySelector('.toggle-all');
	const $main = rootElement.querySelector('.main');
	const $clear = rootElement.querySelector('.clear-completed');
	const $filters = rootElement.querySelector('.filters');

	let filter = getURLHash()

	todoStore.addEventListener('save', render);

	window.addEventListener('hashchange', () => {
		filter = getURLHash();
		render();
	});

	$input.addEventListener('keyup', e => {
		if (e.key === 'Enter') {
			addTodo(e.target.value);
			$input.value = '';
		}
	});

	$toggleAll.addEventListener('click', e => {
		todoStore.toggleAll();
	});

	$clear.addEventListener('click', e => {
		todoStore.clearCompleted();
	});

	render();

	function addTodo(todo) {
		todoStore.add({ title: todo, completed: false, id: "id_" + Date.now() });
	}

	function removeTodo(todo) {
		todoStore.remove(todo);
	}

	function toggleTodo(todo) {
		todoStore.toggle(todo);
	}

	function editingTodo(todo, li) {
		li.classList.add('editing');
		li.querySelector('.edit').focus();
	}

	function updateTodo(todo, li) {
		todoStore.update(todo);
		li.querySelector('.edit').value = todo.title;
	}

	function createTodoItem(todo) {
		const li = document.createElement('li');
		if (todo.completed) { li.classList.add('completed'); }

		li.innerHTML = `
			<div class="view">
				<input class="toggle" type="checkbox" ${todo.completed ? 'checked' : ''}>
				<label></label>
				<button class="destroy"></button>
			</div>
			<input class="edit">
		`;

		li.querySelector('label').textContent = todo.title;
		li.querySelector('.edit').value = todo.title;

		addEvent(li, '.destroy', 'click', () => removeTodo(todo, li));
		addEvent(li, '.toggle', 'click', () => toggleTodo(todo, li));
		addEvent(li, 'label', 'dblclick', () => editingTodo(todo, li));
		addEvent(li, '.edit', 'keyup', e => {
			if (e.key === 'Enter') updateTodo({ ...todo, title: e.target.value }, li)
			if (e.key === 'Escape') {
				e.target.value = todo.title;
				render();
			}
		});
		addEvent(li, '.edit', 'blur', e => updateTodo({ ...todo, title: e.target.value }, li));

		return li;
	}

	function render() {
		const todosCount = todoStore.all().length;
		$filters.querySelectorAll('a').forEach(el => el.classList.remove('selected'));
		$filters.querySelector(`[href="#/${filter}"]`).classList.add('selected');
		$list.innerHTML = '';
		todoStore.all(filter).forEach(todo => {
			$list.appendChild(createTodoItem(todo));
		});
		$footer.style.display = todosCount ? 'block' : 'none';
		$main.style.display = todosCount ? 'block' : 'none';
		$clear.style.display = todoStore.hasCompleted() ? 'block' : 'none';
		$toggleAll.checked = todosCount && todoStore.isAllCompleted();
		$count.innerHTML = `
			<strong>${todoStore.all('active').length}</strong>
			${todoStore.all('active').length === 1 ? 'item' : 'items'} left
		`;
	}
};

const app = createApp(document.body.querySelector('.todoapp'));
