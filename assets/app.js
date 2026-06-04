/*
 * Welcome to your app's main JavaScript file!
 *
 * We recommend including the built version of this JavaScript file
 * (and its CSS file) in your base layout (base.html.twig).
 */

// any CSS you import will output into a single css file (app.css in this case)
import './styles/app.css';

const SearchServices = {

    abortSearchYearsController: null,
    abortSearchSectionsController: null,
    abortSearchSemestersController: null,
    abortSearchPromsController: null,

    abortNotYears: function () {
        if (SearchServices.abortSearchSectionsController) {
            SearchServices.abortSearchSectionsController.abort();
        }
        if (SearchServices.abortSearchSemestersController) {
            SearchServices.abortSearchSemestersController.abort();
        }
        if (SearchServices.abortSearchPromsController) {
            SearchServices.abortSearchPromsController.abort();
        }
    },

    abortNotSections: function () {
        if (SearchServices.abortSearchYearsController) {
            SearchServices.abortSearchYearsController.abort();
        }
        if (SearchServices.abortSearchSemestersController) {
            SearchServices.abortSearchSemestersController.abort();
        }
        if (SearchServices.abortSearchPromsController) {
            SearchServices.abortSearchPromsController.abort();
        }
    },

    abortNotSemesters: function () {
        if (SearchServices.abortSearchSectionsController) {
            SearchServices.abortSearchSectionsController.abort();
        }
        if (SearchServices.abortSearchYearsController) {
            SearchServices.abortSearchYearsController.abort();
        }
        if (SearchServices.abortSearchPromsController) {
            SearchServices.abortSearchPromsController.abort();
        }
    },

    abortNotProms: function () {
        if (SearchServices.abortSearchSectionsController) {
            SearchServices.abortSearchSectionsController.abort();
        }
        if (SearchServices.abortSearchSemestersController) {
            SearchServices.abortSearchSemestersController.abort();
        }
        if (SearchServices.abortSearchYearsController) {
            SearchServices.abortSearchYearsController.abort();
        }
    },

    loadYears: function () {
        SearchServices.abortSearchYearsController = new AbortController();
        fetch('/codex/years', {signal: SearchServices.abortSearchYearsController.signal}).then((r) => {
            SearchServices.abortNotYears();
            r.json().then((res) => {
                const sy = document.querySelector('#formSearchProm select[name="year"]');
                const py = document.querySelector('#formSearchSpeaker select[name="year"]');
                sy.innerHTML = '<option value="">- Année -</option>';
                py.innerHTML = '<option value="">- Année -</option>';
                for (let c of res) {
                    const o = document.createElement('option');
                    o.setAttribute('value', c.id);
                    o.innerText = c.name;
                    const po = o.cloneNode(true);
                    sy.insertAdjacentElement('beforeend', o);
                    py.insertAdjacentElement('beforeend', po);
                }
                SearchServices.loadSections();
            }).catch((e) => {
                console.error(e);
            });
        });
    },

    loadSections: function () {
        SearchServices.abortSearchSectionsController = new AbortController();
        fetch(`/codex/sections`, {signal: SearchServices.abortSearchSectionsController.signal}).then((r) => {
            SearchServices.abortNotSections();
            r.json().then((res) => {
                const ss = document.querySelector('#formSearchProm select[name="section"]');
                ss.innerHTML = '<option value="">- Section -</option>';
                for (let c of res) {
                    const g = document.createElement('optgroup');
                    g.label = c.name;
                    for (let t of c.trainings) {
                        const o = document.createElement('option');
                        o.setAttribute('value', t.id);
                        o.innerText = t.name;
                        g.insertAdjacentElement('beforeend', o);
                    }
                    ss.insertAdjacentElement('beforeend', g);
                }
                SearchServices.loadSemesters();
            });
        }).catch((e) => {
            console.error(e);
        });
    },

    loadSemesters: function () {
        SearchServices.abortSearchSemestersController = new AbortController();
        let s = document.querySelector('#formSearchProm select[name="section"]').value;
        if (!s || isNaN(s)) {
            s = 0;
        }
        fetch(`/codex/semesters/${s}`, {signal: SearchServices.abortSearchSemestersController.signal}).then((r) => {
            SearchServices.abortNotSemesters();
            r.json().then((res) => {
                const ss = document.querySelector('#formSearchProm select[name="semester"]');
                ss.innerHTML = '<option value="">- Semestre -</option>';
                for (let c of res) {
                    const g = document.createElement('optgroup');
                    g.label = c.name;
                    for (let s of c.semesters) {
                        const o = document.createElement('option');
                        o.setAttribute('value', s.id);
                        o.innerText = s.name;
                        g.insertAdjacentElement('beforeend', o);
                    }
                    ss.insertAdjacentElement('beforeend', g);
                }
                SearchServices.searchProms();
            });
        }).catch((e) => {
            console.error(e);
        });
    },

    searchProms: function () {
        SearchServices.abortSearchPromsController = new AbortController();
        let y = document.querySelector('#formSearchProm select[name="year"]').value;
        let t = document.querySelector('#formSearchProm select[name="section"]').value;
        let s = document.querySelector('#formSearchProm select[name="semester"]').value;
        if (!y || isNaN(y)) {
            y = 0;
        }
        if (!t || isNaN(t)) {
            t = 0;
        }
        if (!s || isNaN(s)) {
            s = 0;
        }
        if (0 < (y + t + s)) {
            fetch(`/search/${y}/${t}/${s}`, {signal: SearchServices.abortSearchPromsController.signal}).then((r) => {
                SearchServices.abortNotProms();
                r.json().then((res) => {
                    document.getElementById('resultsProm').innerHTML = '';
                    for (let p of res) {
                        SearchServices.addPromResult(p);
                    }
                });
            }).catch((e) => {
                console.error(e);
            });
        }
    },

    addPromResult: function (data) {
        const tpl = document.importNode(document.querySelector('#promtpl').content, true);
        tpl.querySelector('h3 a').innerText = `${data.sessionName} - ${data.trainingName} - ${data.semesterName}`;
        tpl.querySelector('h3 a').href = `/overview/${data.trainingId}/${data.sessionId}/${data.semesterId}`;
        tpl.querySelector('slot.nbspeakers').innerText = data.nbSpeakers;
        tpl.querySelector('slot.nbmodules').innerText = data.nbModules;
        tpl.querySelector('slot.mxmodules').innerText = data.mxModules;
        tpl.querySelector('slot.nbhours').innerText = data.nbHours;
        tpl.querySelector('slot.mxhours').innerText = data.mxHours;
        document.getElementById('resultsProm').appendChild(tpl);
    },
    
    init: function() {
        document.querySelector('#formSearchProm select[name="year"]').addEventListener('change', () => {
            SearchServices.loadSections();
        });
        document.querySelector('#formSearchProm select[name="section"]').addEventListener('change', () => {
            SearchServices.loadSemesters();
        });
        document.querySelector('#formSearchProm select[name="semester"]').addEventListener('change', () => {
            SearchServices.searchProms();
        });
        document.querySelector('#formSearchProm').addEventListener('submit', (e) => {
            SearchServices.searchProms();
            e.preventDefault();
            return false;
        });
        SearchServices.loadYears();
    }
};

// @TODO : class Repart

const OverviewServices = {
    STATUS_TXT: 'fine',
    STATUS_INF: 'info',
    STATUS_ERR: 'error',
    trainingId: null,
    sessionId: null,
    semesterId: null,
    init: function() {
        OverviewServices.trainingId = document.querySelector('#overviewPage').dataset.training;
        OverviewServices.sessionId = document.querySelector('#overviewPage').dataset.session;
        OverviewServices.semesterId = document.querySelector('#overviewPage').dataset.semester;
        OverviewServices.bindEvents();
    },
    bindEvents: function() {
        document.querySelectorAll('.repart-input').forEach((e) => {
            e.addEventListener('input', OverviewServices.updateField);
            e.addEventListener('focus', el => el.target.select());
        });
        document.querySelector('#applyAsDefault').addEventListener('click', (e) => {
            OverviewServices.saveAllAsDefault();
            e.preventDefault();
            return false;
        });
    },
    updateField: function(ev) {
        const el = ev.target;
        const col = el.parentElement;
        const modeId = col.dataset.mode;
        const line = col.parentElement;
        const moduleId = line.dataset.module;
        const obj = OverviewServices.computeTotalMode(moduleId, modeId);
        OverviewServices.saveRepart(moduleId, modeId, obj.nb, obj.timeby, obj.groups);
        OverviewServices.computeTotalModule(moduleId);
    },
    computeTotalMode: function(moduleId, modeId) {
        const obj = {nb: 0, timeby: 0, groups: 0};
        document.querySelectorAll(`tr[data-module="${moduleId}"] td[data-mode="${modeId}"] input.repart-input`).forEach((e) => {
            if(obj.hasOwnProperty(e.name)) {
                obj[e.name] = e.value;
            }
        });
        const totalCell = document.querySelector(`tr[data-module="${moduleId}"] td[data-mode="${modeId}"].computedModeTotal`);
        totalCell.innerText = (obj.nb * obj.timeby * obj.groups) / 60;
        return obj;
    },
    computeTotalModule: function(moduleId) {
        let sum = 0;
        document.querySelectorAll(`tr[data-module="${moduleId}"] td.computedModeTotal`).forEach((e) => {
            const h = parseFloat(e.innerText);
            if(!isNaN(h)) {
                sum += h;
                e.classList.remove('error');
            } else {
                e.classList.add('error');
            }
        });
        const totalCell = document.querySelector(`tr[data-module="${moduleId}"] td.computedModuleTotal`);
        totalCell.innerText = sum;
    },
    saveRepart: function(moduleId, modeId, nb, timeby, groups) {
        OverviewServices.updateStatus('Sauvegarde en cours...', OverviewServices.STATUS_INF);
        const trainingId = OverviewServices.trainingId;
        const sessionId = OverviewServices.sessionId;
        fetch(`/reparts/${trainingId}/${sessionId}/${moduleId}/${modeId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({nb: nb, timeby: timeby, groups: groups})
        }).then((r) => {
            r.json().then((res) => {
                OverviewServices.updateStatus('Sauvegarde effectuée', OverviewServices.STATUS_TXT);
            }).catch((err) => {
                console.error(err);
                OverviewServices.updateStatus('Echec de la sauvegarde', OverviewServices.STATUS_ERR);
            });
        }).catch((err) => {
            console.error(err);
            OverviewServices.updateStatus('Echec de la sauvegarde', OverviewServices.STATUS_ERR);
        });
    },
    saveAllAsDefault: function() {
        const full = {modules: {}};
        document.querySelectorAll('#reparts tr').forEach((line) => {
            const moduleId = line.dataset.module;
            if(!full.modules.hasOwnProperty(moduleId)) {
                full.modules[moduleId] = {'modes': {}};
            }
            line.querySelectorAll('td[data-mode]').forEach((modeNode) => {
                const modeId = modeNode.dataset.mode;
                if(!full.modules[moduleId].modes.hasOwnProperty(modeId)) {
                    full.modules[moduleId].modes[modeId] = {nb: 0, timeby: 0, groups: 0};
                }
                const inputNode = modeNode.querySelector('input.repart-input');
                if(inputNode) {
                    const inputName = inputNode.name;
                    if(full.modules[moduleId].modes[modeId].hasOwnProperty(inputName)) {
                        full.modules[moduleId].modes[modeId][inputName] = inputNode.value;
                    }
                }
            });
        });
        const trainingId = OverviewServices.trainingId;
        fetch(`/reparts/${trainingId}/default`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(full)
        }).then((r) => {
            r.json().then((res) => {
                OverviewServices.updateStatus('Sauvegarde effectuée', OverviewServices.STATUS_TXT);
            }).catch((err) => {
                console.error(err);
                OverviewServices.updateStatus('Echec de la sauvegarde', OverviewServices.STATUS_ERR);
            });
        }).catch((err) => {
            console.error(err);
            OverviewServices.updateStatus('Echec de la sauvegarde', OverviewServices.STATUS_ERR);
        });
    },
    updateStatus: function(txt, status) {
        const toRemove = [OverviewServices.STATUS_ERR, OverviewServices.STATUS_INF, OverviewServices.STATUS_TXT];
        toRemove.splice(toRemove.indexOf(status));
        document.getElementById('repartsStatus').classList.remove(...toRemove);
        document.getElementById('repartsStatus').classList.add(status);
        document.getElementById('repartsStatus').innerText = txt;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#formSearchProm')) {
        SearchServices.init();
    }
    
    if(document.querySelector('#overviewPage')) {
        OverviewServices.init();
    }
});
