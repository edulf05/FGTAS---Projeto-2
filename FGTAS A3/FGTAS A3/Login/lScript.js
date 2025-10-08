const loginButton = document.getElementById('Login');

loginButton.addEventListener('click', function(event) {
    event.preventDefault(); 
    window.location.href = '../Home/home.html';
});