/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
'use strict';

// Nusitaikom
const allUsersEl = document.querySelector('#allUsers');
const tbodyEl = document.querySelector('tbody');
const createSuccEl = document.querySelector('#createSucc');
const deleteEl = document.querySelector('#delete');

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

allUsersEl.addEventListener('click', async() => await getQuery());

deleteEl.addEventListener('click', async() => {
    const deleteIdEl = document.querySelector('#deleteId');
    await deleteUser(deleteIdEl.value);
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
    }, 3000);
}

async function getQuery() {
    const userNumberEl = document.querySelector('#userNumber');
    let qParam = '';
    if (userNumberEl.value !== '') {
        qParam += `?id=${userNumberEl.value}`;
    }

    const orderbyEl = document.querySelector('#orderby');
    if (orderbyEl.value !== 'space') {
        qParam += qParam === '' ? '?' : '&';
        qParam += `orderBy=${orderbyEl.value}`;
        const orderedEl = document.querySelector('#ordered');
        if (orderedEl.value !== 'space') {
            qParam += `&ordered=${orderedEl.value}`;
        }
    }
    alert(qParam);
    const resp = await fetch(`http://localhost:3000/api/articles${qParam}`);
    createTable(await resp.json());
}

async function deleteUser(id) {
    const resp = await fetch(`http://localhost:3000/api/articles/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archive: true }),
    });
    if (resp.ok) {
        createSuccEl.innerHTML = `${id} useris sekmingai istrintas!!!`;
    } else {
        createSuccEl.innerHTML = `${id} userio istrinti nepavyko!!!`;
    }
    setTimeout(() => {
        createSuccEl.innerHTML = '';
        document.forms[0].reset();
    }, 3000);
}

function createTable(arr) {
    let allEl = '';
    for (let i = 0; i < arr.length; i++) {
        const turiMasina = arr[i].hasCar ? 'turi' : 'neturi';
        allEl += `<tr><td>${arr[i].id}</td><td>${arr[i].name}</td><td>${arr[i].age}</td><td>${turiMasina}</td><td>${arr[i].town}</td><td>${arr[i].createdAt.substring(0,10)}<br>${arr[i].createdAt.substring(11,19)}</td></tr>`;
    }
    tbodyEl.innerHTML = allEl;
}