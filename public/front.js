// Nusitaikom
const allUsersEl = document.querySelector('#allUsers');
const nameAscsEl = document.querySelector('#nameAsc');
const nameDescsEl = document.querySelector('#nameDesc');
const tbodyEl = document.querySelector('tbody');
const createSuccEl = document.querySelector('#createSucc');
const userIdEl = document.querySelector('#userId');
const hasCarEl = document.querySelector('#hasCar');
const adultsEl = document.querySelector('#adults');
const townEl = document.querySelector('#townId');

// AddEventListener
document.forms[0].addEventListener('submit', (e) => {
    e.preventDefault();
    const { name, age, hasCar, town } = e.target;
    const dummy = {
        name: name.value,
        age: age.value,
        hasCar: hasCar.checked,
        town: town.value,
    };
    createUser(dummy);
});

allUsersEl.addEventListener('click', async() => await getUsers());
nameAscsEl.addEventListener('click', async() => await getUsersOrder('asc'));
nameDescsEl.addEventListener('click', async() => await getUsersOrder('desc'));
userIdEl.addEventListener('click', async() => {
    const userNumberEl = document.querySelector('#userNumber');
    if (userNumberEl.value === '') {
        alert('Neivedet ID');
        return;
    }
    await getUsersId(userNumberEl.value);
});
hasCarEl.addEventListener('click', async() => await getUsersHasCar());
adultsEl.addEventListener('click', async() => await getUsersAdults());
townEl.addEventListener('click', async() => {
    const townNumberEl = document.querySelector('#townNumber');
    if (townNumberEl.value === '') {
        alert('Neivedet miesto');
        return;
    }
    await getUsersTown(townNumberEl.value);
});

// Funkcijos
async function createUser(newPostObj) {
    const resp = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(newPostObj),
    });
    if (resp.status === 201) {
        createSuccEl.innerHTML = 'Naujas useris sekmingai irasytas!!!';
    } else {
        createSuccEl.innerHTML = 'Naujas userio irasymas nesekmingas!!!';
    }
    setTimeout(() => {
        createSuccEl.innerHTML = '';
        document.forms[0].reset();
    }, 3000)
}

async function getUsers() {
    const resp = await fetch('http://localhost:3000/api/users');
    createTable(await resp.json());
}

async function getUsersOrder(orderDirect) {
    const resp = await fetch(`http://localhost:3000/api/users/order/${orderDirect}`);
    createTable(await resp.json());
}

async function getUsersId(id) {
    const resp = await fetch(`http://localhost:3000/api/users/${id}`);
    if (!resp.ok) {
        alert('rezultatu nera !!!')
        return
    }
    createTable(await resp.json());
}

async function getUsersHasCar() {
    const resp = await fetch('http://localhost:3000/api/users/drivers');
    createTable(await resp.json());
}

async function getUsersAdults() {
    const resp = await fetch('http://localhost:3000/api/users/adults');
    createTable(await resp.json());
}

async function getUsersTown(name) {
    const resp = await fetch(`http://localhost:3000/api/users/towns/${name}`);
    if (!resp.ok) {
        alert('rezultatu nera !!!')
        return
    }
    createTable(await resp.json());
}

function createTable(arr) {
    let allEl = '';
    for (let i = 0; i < arr.length; i++) {
        turiMasina = arr[i].hasCar ? 'turi' : 'neturi'
        allEl += `<tr><td>${arr[i].id}</td><td>${arr[i].name}</td><td>${arr[i].age}</td><td>${turiMasina}</td><td>${arr[i].town}</td><td>${arr[i].createdAt.substring(0,10)}<br>${arr[i].createdAt.substring(11,19)}</td></tr>`;
    }
    tbodyEl.innerHTML = allEl;
}