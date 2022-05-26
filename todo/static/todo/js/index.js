'use strict';

const URL_API = 'api/todoservice';


const FILTERS_TABS = '#filter_tabs';
const TASKS_COUNTER = '#tasks_count';
const TASKS = '#tasks_list';

const FILTER_ALL = 'FILTER_ALL'
const FILTER_ACTIVE = 'FILTER_ACTIVE'
const FILTER_DONE = 'FILTER_COMPLITED'

let FILTER_SELECTED = FILTER_ALL

class ToDo {
    constructor() {
        this._tasks = []
        this.renderHTML()
    }

    renderHTML = () => {
        this.__getTasks()
        this._renderTabs()
    }

    filterAll() {
        FILTER_SELECTED = FILTER_ALL
        this.renderHTML()
    }

    filterActive() {
        FILTER_SELECTED = FILTER_ACTIVE
        this.renderHTML()
    }

    filterDone() {
        FILTER_SELECTED = FILTER_DONE
        this.renderHTML()
    }



    _renderTabs = () => {
    let tabsElement = ` <div class="${FILTER_SELECTED === FILTER_ACTIVE ? 'tab_selected' :'tabs'}" onclick={todo.filterActive()} >active</div>
        <div class="${FILTER_SELECTED === FILTER_ALL ? 'tab_selected' :'tabs'}" onclick={todo.filterAll()}>all</div>
        <div class="${FILTER_SELECTED === FILTER_DONE ? 'tab_selected' :'tabs'}" onclick={todo.filterDone()}>done</div>
      `
      document.querySelector(FILTERS_TABS).innerHTML = tabsElement;
    }

    _renderCounter = () => {
        document.querySelector(TASKS_COUNTER).innerHTML = `Всего задач: ${this._tasks.length()}`;
    }

    __getTasks() {
        fetch(URL_API)
            .then(response => response.json())
            .then(data => this.__serializeTask(data))
            .then(() => this._tasks.renderHTML())
            .then(() => this._renderCounter())
            .catch(error => console.error('Unable to get items.', error));
    }

    __serializeTask = (data) => {
        this._tasks = new TaskList()
        if (data.length)
            data[0].forEach((itemTask) => {
                let task = new Task(itemTask)
                this._tasks.append(task)
            });
    }

    _delete(id) {
        const divTask = document.getElementById(id);
        
        fetch(`${URL_API}/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(() => this.__getTasks())
            .then(() => divTask.outerHTML = "")
            .catch(error => console.error(`Unable to delete file ${id}`, error))
    }

    _complete(id) {
        id = id + ''
        const divTask = document.getElementById(id);
        if (divTask) {
            this.__changeStatus(id)
        }
    }

    _uncomplete(id) {
        id = id + ''
        const divTask = document.getElementById(id);
        if (divTask) {
            this.__changeStatus(id, false)
        }
    }



    _newTask() {
        const newTaskTitle = document.getElementById('newtask_title');
        const item = {
            id: 0,
            title: newTaskTitle.value.trim(),
            is_completed: false
        };
        if (item.title) {
            fetch(URL_API, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(item)
            })
                .then(response => response.json())
                .then(() => this.__getTasks())
                .then(() => newTaskTitle.value = "")
                .catch(error => console.error('Unable to add item.', error))
        }
    }


    __changeStatus(id, taskStatus = true) {
        let itemTask = this._tasks.getDataOfTask(+id);

        itemTask["is_completed"] = taskStatus;
        if (itemTask.title) {
            fetch(URL_API + `/${id + ''}`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(itemTask)
            })
                .then(response => response.json())
                .then(() => this.__getTasks())
                .catch(error => console.error('Unable to add item.', error));
        }
    }

    _edit(id) {
        let itemTask = this._tasks.getDataOfTask(+id);
        const item = document.getElementById(id);
        itemTask.title = item.childNodes[1].childNodes[1].value;
        if (itemTask.title) {
            fetch(URL_API + `/${id + ''}`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(itemTask)
            })
                .then(response => response.json())
                .then(() => this.__getTasks())
                .catch(error => console.error('Unable to add item.', error));
        }
    }
}

class Task {
    constructor(data) {
        this.id = data.id
        this.title = data.title
        this.is_completed = data.is_completed
    }

    getDataOfTask = () => ({
        id: this.id,
        title: this.title,
        is_completed: this.is_completed
    })

    is_equal = (task) => {
        return task.id === this.id
    }

    compileHTML = () => {

        let render_buttons_done_undone = () => {
            if (!this.is_completed) {
                return `<div class="done" onclick={todo._complete(${this.id})}>
                <img src="static/todo/images/done_icon.png" style="width: 35px;height: 35px">
                </div>
                `
            }
            else {
                return ` <div class="edit" onclick={todo._uncomplete(${this.id})}>
        <img src="static/todo/images/edit_icon.png" style="width: 35px;height: 35px">
        </div>` }
        }
        return `
        <div id="${this.id}" class=${this.is_completed ? "done_task" : "task"} >
            <div>
                <input type="text" value="${this.title}" onchange={todo._edit(${this.id})}>
            </div>
            <div>
           ${render_buttons_done_undone()}
            <div class="del" onclick={todo._delete(${this.id})}>
            <img src="static/todo/images/del_icon.png" style="width: 35px;height: 35px"
          />
            </div>
            </div>
        </div>
        `
    }



    renderHTML = () => {
        document.querySelector(TASKS).innerHTML += this.compileHTML();
    }
}


class TaskList {
    constructor(filter = FILTER_SELECTED) {
        this.task_list = []
        this.filter = filter
    }

    length = () => this.task_list.length

    append = (newTask) => {
        switch (this.filter) {
            case FILTER_ALL: { this.task_list.push(newTask); break }
            case FILTER_ACTIVE: { !newTask.is_completed ? this.task_list.push(newTask) : undefined; break }
            case FILTER_DONE: { newTask.is_completed ? this.task_list.push(newTask) : undefined; break }
            default: undefined
        }
    }

    getDataOfTask = (id) => {
        let taskData = ''
        this.task_list.map(task => {
            if (task.id === id) {
                taskData = task.getDataOfTask()
            }
            return true
        })
        return taskData
    }

    renderHTML = () => {
        document.querySelector(TASKS).innerHTML = "";
        this.task_list.map(task => task.renderHTML())
    }

}