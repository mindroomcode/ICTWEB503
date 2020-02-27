// Cache reusable objects
var postsEl = document.getElementById('posts');
var endpoint = 'https://ictweb503.mindroom.edu.au/wp-json/wp/v2/posts'; 

renderUI();


function renderUI(){
    postsRead();
    addCreatePosts();
}

function isLoggedIn(){
    if (localStorage.getItem('token')) return true;
    return false;
}

/**
 * Read all posts
 */
function postsRead(){
    // get data
    fetch(endpoint + '?cacheBusting=' + Math.random()).then(r => r.json())
    .then(posts => {

        // remove the loader gif
        postsEl.innerHTML = '';



        // add each post to the screen
        posts.forEach(post => {

            deleteButton = '';

            if(isLoggedIn()){
                var deleteButton = `
                <button onclick="postDelete(${post.id})" style="float: right">
                    Delete
                </button>` 
                var isEditable = 'contenteditable="true"'; 
            } 

            postsEl.innerHTML += `
                <div class="post" data-id="${post.id}">
                    <p class="post-title" onfocus="postEdit(this)" ${isEditable}>${post.title.rendered}</p>
                    ${deleteButton}             
                </div>
                <hr>
            `
        });
    });
}

/**
 * Create a post
 * @param {object} param0 title of the new post
 */
function postCreate({title}){
    fetch(endpoint, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
            title: title,
            status: 'publish'
        })
    }).then(r=>r.json())
    .then(function(wpResponse){
        console.log(wpResponse);
        postsRead();
    });
}

/**
 * Update a post
 * @param {integer} id of the post
 * @param {object} param1 contain new title of the post
 */
function postUpdate(id, {title}){ 

    fetch(endpoint + '/' + id, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
            title: title,
            status: 'publish'
        })
    }).then(r=>r.json())
    .then(function(wpResponse){
        console.log(wpResponse);
        postsRead();
    });
}

function postEdit(input){

    var original = input.innerText
    var post = input.closest('.post')

    if(!post) return

    var id = post.dataset.id;

    input.onblur = function(){
        if(original != input.innerText) {
            postUpdate(id, { title: input.innerText })
            return;
        } 
    }
}

/**
 * Delete Posts
 * @param {integer} id the id of the post you want to delete
 */
function postDelete(id){ 
    fetch(endpoint + '/' + id, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    }).then(r=>r.json())
    .then(function(wpResponse){
        console.log(wpResponse);
        postsRead();
    });
}

/**
 * Get authentication token
 * @param {string} username 
 * @param {string} password 
 */
function getToken(username, password){
    fetch('https://ictweb503.mindroom.edu.au/wp-json/jwt-auth/v1/token', {
        method: 'POST',
        body: JSON.stringify({
            username: username,
            password: password
        }),
        headers: {
            'Content-type': 'application/json',
        }
    })
    .then(r => r.json())
    .then(function(json){ 

           if(json.token){
               localStorage.setItem('token', json.token);
               renderUI();
           }



     });
}

function login(button){

    var form = button.closest('form');
    var username = form.querySelector('[name=username]').value;
    var password = form.querySelector('[name=password]').value;
    
    getToken(username, password);

     renderUI();

    return false;

}


function addCreatePosts(){

    var createPostsEl = document.getElementById('createPosts');

    if(isLoggedIn()) {
        createPostsEl.innerHTML =`
        <input type="text" placeholder="Create Post...">
       <button onclick="postCreate({title: this.previousElementSibling.value}); this.previousElementSibling.value = ''">
           Add a Post
       </button>`
    } else {
        createPostsEl.innerHTML = '';
    };




}

function logout(){
    localStorage.clear('token');
    renderUI();
    return false;
}