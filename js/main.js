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
        localStorage.setItem('refreshToken', refreshToken);


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
            <td>
              <button onclick="editUser('${user.id}')">Bearbeiten</button>
                <button onclick="deleteUser('${user.id}')">Löschen</button>
            </td>
        `;
        usersBody.appendChild(row);
    });
}
async function editUser(userId) {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetch(`https://market.fb-development.de/api/v1/users/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });
    const user = await response.json();
    
   
    const modal = document.getElementById('editModal');
    modal.style.display = 'block';
    document.getElementById('editFirstName').value = user.firstname;
    document.getElementById('editLastName').value = user.lastname;
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editRoles').value = user.roles;
    document.getElementById('saveChangesButton').onclick = async function() {
        await saveUserChanges(userId);
        alert('Die Bearbeitung war erfolgreich!');

        document.getElementById('editModal').style.display = 'none';
        location.reload();
    };

   

}

async function saveUserChanges(userId) {
    const accessToken = localStorage.getItem('accessToken');

    const rolesInput = document.getElementById('editRoles').value;
    const rolesArray = rolesInput ? rolesInput.split(',').map(role => role.trim()) : [];

    const updatedUser = {
        firstname: document.getElementById('editFirstName').value,
        lastname: document.getElementById('editLastName').value,
        email: document.getElementById('editEmail').value,
        roles: rolesArray 
    };
    
     console.log(updatedUser);
    const response = await fetch(`https://market.fb-development.de/api/v1/users/${userId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(updatedUser)
    });

}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
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
    if (!token) {
        return true; 
    }
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000; 
    return Date.now() > expiryTime;
}

const accessToken = localStorage.getItem('accessToken');
async function checkAndUpdateToken() {
    if (accessToken && isTokenExpired(accessToken)) {
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


async function deleteUser(userId) {
    if (confirm('Möchten Sie diesen Benutzer wirklich löschen?')) {
        const accessToken = localStorage.getItem('accessToken');
        const response = await fetch(`https://market.fb-development.de/api/v1/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.ok) {
            alert('Benutzer erfolgreich gelöscht');
            fetchAllUsers();  
        } else {
            alert('Fehler beim Löschen des Benutzers');
        }
    }
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
        // Aktualisiere das Access-Token im localStorage
        localStorage.setItem('accessToken', data.accessToken);
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Tokens:', error);
    }
}

document.getElementById('addUserForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const firstName = document.getElementById('addFirstName').value;
    const lastName = document.getElementById('addLastName').value;
    const email = document.getElementById('addEmail').value;
    const rolesInput = document.getElementById('addRoles').value;
    const rolesArray = rolesInput ? rolesInput.split(',').map(role => role.trim()) : [];

    const newUser = {
        firstname: firstName,
        lastname: lastName,
        email: email,
        roles: rolesArray
    };

    try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await fetch('https://market.fb-development.de/api/v1/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(newUser)
        });

        if (!response.ok) {
            throw new Error('Fehler beim Hinzufügen des Benutzers');
        }

        // Benutzer erfolgreich hinzugefügt
        document.getElementById('addMessage').innerText = 'Benutzer erfolgreich hinzugefügt!';
        document.getElementById('addUserForm').reset(); // Formular zurücksetzen
        $('#addUserModal').modal('hide'); // Modal schließen
        fetchAllUsers(); // Alle Benutzer erneut laden

    } catch (error) {
        document.getElementById('addMessage').innerText = 'Fehler: ' + error.message;
        console.error('Fehler:', error);
    }
});
