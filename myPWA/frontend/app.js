if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.querySelector('.add_btn');
    const taskForm = document.querySelector('.create_task');
    const noTasksMessage = document.querySelector('.empty');
    const searchBtn = document.getElementById('search_btn');
    const searchDateInput = document.getElementById('search_date');
    let isEditMode = false;
    let editId = null;

    addBtn.addEventListener('click', () => {
        taskForm.style.display = 'flex';
    });
    
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskName = document.getElementById('task_name').value;
        const taskDate = document.getElementById('task_date').value;
        const taskPriority = document.getElementById('task_priority').value;

        if (isEditMode) {
            updateTask(editId, taskName, taskDate, taskPriority);
        } else {
            addTask(taskName, taskDate, taskPriority);
        }

        taskForm.reset();
        taskForm.style.display = 'none';
        isEditMode = false;
        editId = null;
    });

    searchBtn.addEventListener('click', () => {
        const searchDate = searchDateInput.value;
        if (searchDate) {
            loadTasks(searchDate);
        } else {
            loadTasks();
        }
    });

    function addTask(name, date, priority) {
        fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, date, priority })
        })
        .then(response => response.json())
        .then(data => {
            displayTask({ id: data.id, name, date, priority, completed: 0 });
            noTasksMessage.style.display = 'none';
        })
        .catch(error => console.error('Error:', error));
    }

    function updateTask(id, name, date, priority) {
        fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, date, priority, completed: 0 })
        })
        .then(() => {
            loadTasks();
        })
        .catch(error => console.error('Error:', error));
    }

    function deleteTask(id) {
        fetch(`/api/tasks/${id}`, {
            method: 'DELETE'
        })
        .then(() => {
            loadTasks();
        })
        .catch(error => console.error('Error:', error));
    }

    function editTask(id) {
        fetch(`/api/tasks/${id}`)
        .then(response => response.json())
        .then(task => {
            document.getElementById('task_name').value = task.name;
            document.getElementById('task_date').value = task.date;
            document.getElementById('task_priority').value = task.priority;
            isEditMode = true;
            editId = task.id;
            taskForm.style.display = 'flex';
        })
        .catch(error => console.error('Error:', error));
    }

    function loadTasks(date = '') {
        let url = '/api/tasks';
        if (date) {
            url += `?date=${date}`;
        }
        fetch(url)
        .then(response => response.json())
        .then(data => {
            clearTaskLists();
            data.forEach(task => {
                displayTask(task);
            });
            noTasksMessage.style.display = taskListIsEmpty() ? 'block' : 'none';
        })
        .catch(error => console.error('Error:', error));
    }

    function clearTaskLists() {
        document.querySelectorAll('.task_list').forEach(list => {
            list.innerHTML = '';
        });
    }

    function taskListIsEmpty() {
        return !document.querySelector('.task_list li');
    }

    function displayTask(task) {
        const taskItem = document.createElement('li');
        taskItem.innerHTML = `
            ${task.name} - ${task.date} - Priority: ${task.priority}
            <button onclick="editTask(${task.id})">Edit</button>
            <button onclick="deleteTask(${task.id})">Delete</button>
        `;
        document.querySelector(`.priority-${task.priority}`).appendChild(taskItem);
    }

    loadTasks();

    // Expose functions to the global scope
    window.editTask = editTask;
    window.deleteTask = deleteTask;
});
