function sendForm() {
    alert("Форма была успешно отправлена на сервер")
}

$('form').on('submit', () => {
    sendForm();
    return false;
});

Authorization('https://sas.front.kreosoft.space/api/auth', {
    "username": "liza",
    "password": "liza"
})
    .then((data) => localStorage.setItem('token', data.access))
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

$('#exampleModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget)
    var name = button.data('name')
    var priority = button.data('priority')
    var description = button.data('description')
    var modal = $(this)
    modal.find('form').find('#recipient-name').val(name);
    modal.find('form').find('#inputDescription').val(description);
    modal.find('form').find('#priority').val(priority);
})

function LoadNews() {
    let response = fetch('https://sas.front.kreosoft.space/api/news', {
        headers: new Headers({
            'Authorization': 'Bearer' + localStorage.getItem('token')
        })
    })
        .then((response) => {
            return response.json();
        })
        .then((json) => {
            $("#all-news").empty();
            $template = $("#news-template");
            for (let news of json) {
                $newsCard = $template.clone();
                $newsCard.removeClass("d-none");
                $newsCard.find(".card-header").attr("id", "news-" + news.id);
                $newsCard.find(".btn").attr("data-target", "#collapseNews-" + news.id);
                $newsCard.find(".btn").attr("aria-controls", "collapseNews-" + news.id);
                $newsCard.find(".news-title").text(news.title);
                $newsCard.find(".news-tags").text(news.tags);
                $newsCard.find(".collapse").attr("id", "collapseNews-" + news.id);
                $newsCard.find(".collapse").attr("aria-labelledby", "news-" + news.id);
                $newsCard.find(".news-content").text(news.content);
                $newsCard.find(".news-date").text(getFormattedDate(news.date));
                $newsCard.find(".news-likes").text(news.serviceInfo.likes);
                $newsCard.find(".news-likes").attr("id", "news-likes" + news.id);
                $newsCard.find(".image").attr("src", `${getSrc(news.id)}`);

                //$newsCard.find(".fa-heart").attr("id", "heart" + news.id);
                $newsCard.find(".fa-heart").on("click", function () { changeLikes(news.id) });
                $("#all-news").append($newsCard);
            }
        }).catch(error => console.error(error));
}
function getSrc(id) {
    if (id == 1) return "https://git.hits.tsu.ru/Subject-Web/Web-Frontend-Manual/-/raw/master/Current/2.%20Bootstrat%20and%20fetch/media/news/img-spacex-1.jpg";
    if (id == 2) return "https://git.hits.tsu.ru/Subject-Web/Web-Frontend-Manual/-/raw/master/Current/2.%20Bootstrat%20and%20fetch/media/news/Crew-2.png";
    if (id == 3) return "https://git.hits.tsu.ru/Subject-Web/Web-Frontend-Manual/-/raw/master/Current/2.%20Bootstrat%20and%20fetch/media/news/falcon9.jpg";
    if (id == 4) return "https://git.hits.tsu.ru/Subject-Web/Web-Frontend-Manual/-/raw/master/Current/2.%20Bootstrat%20and%20fetch/media/news/SpaceX-Logo.png";
}
function getFormattedDate(datetime) {
    var date = new Date(datetime);
    let year = date.getFullYear();
    let month = (1 + date.getMonth()).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');
    return day + '.' + month + '.' + year;
}
function changeLikes(id) {
    post('https://sas.front.kreosoft.space/api/News/like', { "id": id })
        .then(data => {
            let response = fetch('https://sas.front.kreosoft.space/api/news', {
                headers: new Headers({
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                })
            })
                .then((response) => {
                    return response.json();
                })
                .then((json) => {
                    $("#news-likes" + id).text(json[id - 1].serviceInfo.likes);
                })
        })
        .catch(error => console.error(error))

}

function post(url, data) {
    return fetch(url, {
        credentials: 'same-origin',  // параметр определяющий передвать ли разные сессионные данные вместе с запросом
        method: 'POST',              // метод POST 
        body: JSON.stringify(data),  // типа запрашиаемого документа
        headers: new Headers({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer' + localStorage.getItem('token')
        }),
    })
}


LoadNews();
