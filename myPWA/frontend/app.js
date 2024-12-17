document.addEventListener('DOMContentLoaded', () =>{
    const addBtn = document.querySelector('.add_btn');
    const taskForm = document.querySelector('.create_task');
    const taskList = document.querySelector('.task_list');
    const noTasksMessage = document.querySelector('.empty');

    addBtn.addEventListener('click', ()=> {
        taskForm.style.display = 'flex';
    });
})