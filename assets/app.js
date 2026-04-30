/*
 * Welcome to your app's main JavaScript file!
 *
 * We recommend including the built version of this JavaScript file
 * (and its CSS file) in your base layout (base.html.twig).
 */

// any CSS you import will output into a single css file (app.css in this case)
import './styles/app.css';

function loadYears() {
    fetch('/codex/years').then((r) => {
        r.json().then((res) => {
            const sy = document.querySelector('#formSearchProm select[name="year"]');
            const py = document.querySelector('#formSearchSpeaker select[name="year"]');
            sy.innerHTML = '<option>- Année -</option>';
            py.innerHTML = '<option>- Année -</option>';
            for(let c of res) {
                const o = document.createElement('option');
                o.setAttribute('value', c.rowid);
                o.innerText = c.name;
                const po = o.cloneNode(true);
                sy.insertAdjacentElement('beforeend', o);
                py.insertAdjacentElement('beforeend', po);
            }
            loadSections();
        });
    });
}

function loadSections() {
    let y = document.querySelector('#formSearchProm select[name="year"]').value;
    if(!y || isNaN(y)) { y = 0; }
    console.log(document.querySelector('#formSearchProm select[name="year"]'));
    fetch(`/codex/years/${y}/sections`).then((r) => {
        r.json().then((res) => {
            const ss = document.querySelector('#formSearchProm select[name="section"]');
            ss.innerHTML = '<option>- Section -</option>';
            for(let c of res) {
                const o = document.createElement('option');
                o.setAttribute('value', c.rowid);
                o.innerText = c.name;
                ss.insertAdjacentElement('beforeend', o);
            }
            loadSemesters();
        });
    });
}

function loadSemesters() {
    let y = document.querySelector('#formSearchProm select[name="year"]').value;
    if(!y || isNaN(y)) { y = 0; }
    let s = document.querySelector('#formSearchProm select[name="section"]').value;
    if(!s || isNaN(s)) { s = 0; }
    fetch(`/codex/years/${y}/sections/${s}/semesters`).then((r) => {
        r.json().then((res) => {
            const ss = document.querySelector('#formSearchProm select[name="semester"]');
            ss.innerHTML = '<option>- Semestre -</option>';
            for(let c of res) {
                const o = document.createElement('option');
                o.setAttribute('value', c.rowid);
                o.innerText = c.name;
                ss.insertAdjacentElement('beforeend', o);
            }
            searchProms();
        });
    });
}

function searchProms() {
    fetch(`/codex/years/${y}/sections/${s}/semesters`).then((r) => {
        r.json().then((res) => {
            const ss = document.querySelector('#formSearchProm select[name="semester"]');
            ss.innerHTML = '<option>- Semestre -</option>';
            for(let c of res) {
                const o = document.createElement('option');
                o.setAttribute('value', c.rowid);
                o.innerText = c.name;
                ss.insertAdjacentElement('beforeend', o);
            }
            //ss.trigger('change');
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if(document.querySelector('#formSearchProm')) {
        document.querySelector('#formSearchProm select[name="year"]').addEventListener('change', () => {
            loadSections();
        });
        document.querySelector('#formSearchProm select[name="section"]').addEventListener('change', () => {
            loadSemesters();
        });
        document.querySelector('#formSearchProm').addEventListener('submit', (e) => {
            searchProms();
            e.preventDefault();
            return false;
        });
        loadYears();
    }
});
