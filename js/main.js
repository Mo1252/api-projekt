document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault()
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('https://market.fb-development.de/api/v1/auth/sign-in', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        if (!response.ok) {
            throw new Error('Fehler bei der Authentifizierung');
        }

        const data = await response.json();
        const accessToken = data.accessToken;
        const refreshToken = data.refreshToken;


        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToxken', refreshToken);


        document.getElementById('message').innerText = 'Erfolgreich eingeloggt!';
        document.getElementById('loginForm').style.display = 'none';

        await fetchAllUsers();


    } catch (error) {
        document.getElementById('message').innerText = 'Fehler: ' + error.message;
        console.error('Fehler:', error);
    }
});



async function fetchAllUsers() {

    const accessToken = localStorage.getItem('accessToken');
    const response = await fetch('https://market.fb-development.de/api/v1/users/?page=1&limit=10', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });
    const data = await response.json();
    const users = data.data;
    document.getElementById('usersTable').style.display = 'table';
    document.getElementById('search').style.display = 'block';

    const usersBody = document.getElementById('usersBody');
    usersBody.innerHTML = ''; 

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `   
            <td>${user.firstname} ${user.lastname}</td>
            <td>${user.email}</td>
            <td>${user.roles}</td>
        `;
        usersBody.appendChild(row);
    });
}

async function updateToken() {
    const refreshToken = localStorage.getItem('refreshToken');

    try {
        const response = await fetch('https://market.fb-development.de/api/v1/auth/refresh-access-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
        });

        if (!response.ok) {
            throw new Error('Fehler beim Aktualisieren des Tokens');
        }

        const data = await response.json();
            localStorage.setItem('accessToken',data.accessToken);
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Tokens:', error);
    }
}
function isTokenExpired(token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000; 
    return Date.now() > expiryTime;
}

const accessToken = localStorage.getItem('accessToken');
async function  checkAndUpdateToken()
{

    if (isTokenExpired(accessToken)) {
        await updateToken();
    }
} 

 checkAndUpdateToken(); 



 document.addEventListener('DOMContentLoaded', async () => {
    await checkAndUpdateToken(); 
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
       
        await fetchAllUsers();
        document.getElementById('loginForm').style.display = 'none'; 
       
    }
});


$(window).on('scroll', function() {
    if ($(window).scrollTop() > 50) {
        $('.navbar').addClass('scrolled');
    } else {
        $('.navbar').removeClass('scrolled');
    }
});