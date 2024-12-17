document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.querySelector('.add_btn');
    const taskForm = document.querySelector('.create_task');
    const taskList = document.querySelector('.task_list');
    const noTasksMessage = document.querySelector('.empty');
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

    function loadTasks() {
        let url = '/api/tasks';
        fetch(url)
        .then(response => response.json())
        .then(data => {
            taskList.innerHTML = '';
            data.forEach(task => {
                displayTask(task);
            });
            noTasksMessage.style.display = taskList.children.length ? 'none' : 'block';
        })
        .catch(error => console.error('Error:', error));
    }

    function displayTask(task) {
        const taskItem = document.createElement('li');
        taskItem.innerHTML = `
            ${task.name} - ${task.date} - Priority: ${task.priority}
        `;
        taskList.appendChild(taskItem);
    }    

    loadTasks();
});
