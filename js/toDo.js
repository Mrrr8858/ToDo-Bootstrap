const listsURL = 'https://sas.front.kreosoft.space/api/ToDoList';
const elemURL = 'https://sas.front.kreosoft.space/api/ToDoItem'
let token = Authorization('https://sas.front.kreosoft.space/api/auth', {
    "username": "liza",
    "password": "liza"
})
    .then((data) => {
        getToDoLists(listsURL, data.accessToken)
            .then((d) => console.log(d));
    })
    .catch(error => console.error(error))

function Authorization(url, data) {
    return fetch(url, {
        credentials: "same-origin",
        method: 'POST',
        body: JSON.stringify(data),
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
    })
        .then(response => response.json())
}

$('#postList').click(function () { postList(listsURL) });
$('#postElem').click(function () { postElem(elemURL) });

function CreateToDoList() {
    let response = fetch(listsURL, {
        headers: new Headers({
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        })
    })
        .then((response) => {
            return response.json();
        })
        .then((json) => {
            $("#myTab").empty();
            $("#myTabContent").empty();
            $("#listID").empty();
            let i = 0;
            $("#listOfElem").empty();
            $task = $("#elem-template");
            $template = $("#list-template");
            $content = $("#tab-template");
            for (let lists of json) {
                i++;
                $newList = $template.clone();
                $newList.removeClass("d-none");
                $newList.find('.text-name-list').text("Список дел №" + i + "-" + lists.name);
                $newList.find('.text-name-list').attr('id', i + "-tab");
                $newList.find('.text-name-list').attr('aria-controls', i);
                $newList.find('.text-name-list').attr('href', "#tab" + i);
                $newContent = $content.clone();
                if (i == 1) {
                    $newList.find('.text-name-list').addClass('active');
                    $newContent.addClass('active');
                }
                $newContent.removeClass("d-none");
                $newContent.find('.text-name-list').text("Список дел №" + i + "-" + lists.name);
                $newContent.attr('id', "tab" + i);
                $newContent.attr('aria-labelledby', i + "-tab");
                for (let smth of lists.items) {
                    $newTask = $task.clone();
                    $newTask.removeClass("d-none");
                    $newTask.addClass("d-flex");

                    let colorRriority;
                    if (smth.priority == 0) colorRriority = "bg-light"
                    else if (smth.priority == 1) colorRriority = "bg-warning"
                    else if (smth.priority == 2) colorRriority = "bg-danger"

                    $newTask.find('.text-priority').addClass(colorRriority);
                    $newTask.find('.text-name').text(smth.name);
                    $newTask.find('.text-date').text(getFormattedDate(new Date()));
                    $newTask.find('.text-description').text(smth.description);

                    if (smth.isDone) {
                        $newTask.attr("style", "background-color: rgba(0, 128, 0, 0.363);");
                        $newTask.find('#btnGroup').replaceWith("<span class='m-3'><i class='fas fa-check fa-2x' style='color: Green';></i></span>");
                    }
                    else {
                        $newTask.find('.edit').attr("data-name", smth.name);
                        $newTask.find('.edit').attr("data-priority", smth.priority);
                        $newTask.find('.edit').attr("data-description", smth.description);
                        $newTask.find('.edit').attr("id", "btn-" + smth.id);
                        $newTask.find('.edit').attr("value", `${smth.name}_${smth.description}_${smth.priority}_${lists.id}_${smth.id}`);
                        $newTask.find('.edit').attr("onclick", ` modal(${smth.id})`)
                        $newTask.find('.deleteTask').on("click", function () { deleteElem(elemURL, smth.id, lists.ownerId) });
                        $newTask.find('.done').on("click", function () { checkElem(smth.id, lists.ownerId) });
                    }
                    $newContent.find("#listOfElem").append($newTask);
                }
                $newContent.find('.deleteList').on("click", function () { deleteList(listsURL, lists.id) });
                $("#listID").append("<option value= " + lists.id + ">" + "Список дел №" + i + "-" + lists.name + "</option>");
                $("#myTab").append($newList);
                $("#myTabContent").append($newContent);
            }
        }).catch(error => console.error(error));
}
CreateToDoList();
function getToDoLists(url, token) {
    localStorage.setItem('token', token);
    header = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
    };
    return fetch(url, {
        method: 'GET',
        headers: header
    })
        .then(responce => {
            if (responce.ok) {
                return responce.json();
            }
            return responce.json().then(error => {
                const e = new Error();
                e.data = error;
                throw e;
            });
        });
}

function postList(url) {
    let body = {
        "name": document.getElementById('exampleInputName').value
    };
    header = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
    };
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: header
    })
        .then(responce => {
            getToDoLists(listsURL, localStorage.getItem('token'))
                .then(date => CreateToDoList())
        })
}

function deleteList(url, id) {
    let body = {
        "id": id
    };
    return _delete(url, body)
        .then(responce => {
            getToDoLists(listsURL, localStorage.getItem('token'))
                .then(date => CreateToDoList())
        })
}

function deleteElem(url, id, ownerId) {
    let body = {
        "id": id,
        "ownerId": ownerId
    };
    return _delete(url, body)
        .then(responce => {
            getToDoLists(listsURL, localStorage.getItem('token'))
                .then(date => CreateToDoList())
        })
}


function postElem(url) {
    return _post(url, {
        "id": null,
        "name": document.getElementById('inputTitles').value,
        "description": document.getElementById('validationTextarea').value,
        "priority": +document.getElementById('priorityVal').value,
        "listId": +document.getElementById('listID').value
    })
        .then(responce => {
            getToDoLists(listsURL, localStorage.getItem('token'))
                .then(date => CreateToDoList())
        })
        .catch(error => console.error(error));
}

function checkElem(id, ownerId) {
    return _post('https://sas.front.kreosoft.space/api/ToDoItem/check', {
        "ownerId": ownerId,
        "id": id

    })
        .then(responce => {
            getToDoLists(listsURL, localStorage.getItem('token'))
                .then(date => CreateToDoList())
        })
}



function _post(url, data) {
    return fetch(url, {
        credentials: 'same-origin', // параметр определяющий передвать ли разные сессионные данные вместе с запросом
        method: 'POST', // метод POST 
        body: JSON.stringify(data), // типа запрашиаемого документа
        headers: new Headers({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }),
    })
}

function _delete(url, data) {
    return fetch(url, {
        credentials: 'same-origin', // параметр определяющий передвать ли разные сессионные данные вместе с запросом
        method: 'DELETE', // метод POST 
        body: JSON.stringify(data), // типа запрашиаемого документа
        headers: new Headers({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }),
    })
}


// function modal(id, lId){
//     //let value = document.getElementById(`btn-${num}`).value;
//     $("#submit-modal").find('.btn-success').on('click', function() { postEdit(id, lId) });
// }
function modal(number) {
    let value = document.getElementById(`btn-${number}`).value
    document.getElementById('recipient-name').value = getS(value);
    value = deleteS(value);
    document.getElementById('inputDescription').value = getS(value);
    value = deleteS(value);
    console.log(value);
    document.getElementById('priority').value = parseInt(getS(value));
    value = deleteS(value);
    let id = parseInt(getS(value));
    value = deleteS(value);
    $("#submit-modal").attr("onsubmit", `postEdit(elemURL, ${value}, ${id});return false`)
}

function getS(value) {
    let title = [];
    let i = 0;
    while (value[i] != '_') {
        title.push(value[i]);
        i++;
    }
    return title.join("");
}

function deleteS(value) {
    let i = 0;
    value = value.split("");
    while (value[i] != '_') {
        delete value[i];
        i++;
    }
    delete value[i];
    return value.join("");
}

function postEdit(url, id, listID) {
    return _post(url, {
        "id": id,
        "name": document.getElementById('recipient-name').value,
        "description": document.getElementById('inputDescription').value,
        "priority": +document.getElementById('priority').value,
        "listId": listID
    })
        .then(responce => {
            getToDoLists(listsURL, localStorage.getItem('token'))
                .then(date => CreateToDoList())
        })
}









function CreateToDoElem() {
    let response = fetch(listURL, {
        headers: new Headers({
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        })
    })
        .then((response) => {
            return response.json();
        })
        .then((json) => {
            $("#listOfElem").empty();
            $template = $("#elem-template");
            for (let lists of json) {
                i++;
                $newList = $template.clone();
                $newList.removeClass("d-none");
                let colorRriority;
                if (lists.items[i].priority == 1) colorRriority = "bg-light"
                else if (lists.priority == 2) colorRriority = "bg-warning"
                else if (lists.priority == 3) colorRriority = "bg-danger"


                $newList.find('.text-priority').addClass(colorRriority);
                $newList.find('.text-name').text(lists.name);
                $newList.find('.text-date').text(getFormattedDate(new Date()));
                $newList.find('.text-description').text(lists.description);

                $("#listOfElem").append($newList);
            }
        }).catch(error => console.error(error));
}