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
                o.setAttribute('value', c.id);
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
    fetch(`/codex/sections`).then((r) => {
        r.json().then((res) => {
            const ss = document.querySelector('#formSearchProm select[name="section"]');
            ss.innerHTML = '<option>- Section -</option>';
            for(let c of res) {
                const g = document.createElement('optgroup');
                g.label = c.name;
                for(let t of c.trainings) {
                    const o = document.createElement('option');
                    o.setAttribute('value', t.id);
                    o.innerText = t.name;
                    g.insertAdjacentElement('beforeend', o);
                }
                ss.insertAdjacentElement('beforeend', g);
            }
            loadSemesters();
        });
    });
}

function loadSemesters() {
    let s = document.querySelector('#formSearchProm select[name="section"]').value;
    if(!s || isNaN(s)) { s = 0; }
    fetch(`/codex/semesters/${s}`).then((r) => {
        r.json().then((res) => {
            const ss = document.querySelector('#formSearchProm select[name="semester"]');
            ss.innerHTML = '<option>- Semestre -</option>';
            for(let c of res) {
                const g = document.createElement('optgroup');
                g.label = c.name;
                for(let s of c.semesters) {
                    const o = document.createElement('option');
                    o.setAttribute('value', s.id);
                    o.innerText = s.name;
                    g.insertAdjacentElement('beforeend', o);
                }
                ss.insertAdjacentElement('beforeend', g);
            }
            searchProms();
        });
    });
}

function searchProms() {
    const y = document.querySelector('#formSearchProm select[name="year"]').value;
    const t = document.querySelector('#formSearchProm select[name="section"]').value;
    const s = document.querySelector('#formSearchProm select[name="semester"]').value;
    console.log(`Year={y}, Section={t}, Semestre={s}`);
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
