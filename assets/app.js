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

const OverviewServices = {
    STATUS_TXT: 'fine',
    STATUS_ERR: 'error',
    trainingId: null,
    sessionId: null,
    semesterId: null,
    init: function() {
        OverviewServices.trainingId = document.querySelector('#overviewPage').dataset.training;
        OverviewServices.sessionId = document.querySelector('#overviewPage').dataset.session;
        OverviewServices.semesterId = document.querySelector('#overviewPage').dataset.semester;
    },
    bindAdderEvents: function() {
        document.querySelectorAll('.lineAdder').forEach((e) => {
            e.addEventListener('click', OverviewServices.addLine);
        });
    },
    loadReparts: function() {
        const training = OverviewServices.trainingId;
        const session = OverviewServices.sessionId;
        const semester = OverviewServices.semesterId;
        fetch(`/reparts/${training}/${session}/${semester}`).then((r) => {
            r.json().then((res) => {
                OverviewServices.clearLines();
                for(l of res) {
                    OverviewServices.addFilledLine(l);
                }
            });
        });
    },
    clearLines: function() {
        document.getElement('reparts').innerHTML = '';
    },
    addLine: function() {
        const tpl = document.importNode(document.querySelector('tpl_repartline').content, true);
        // @TODO
        document.getElementById('reparts').appendChild(tpl);
    },
    addFilledLine: function(lineData) {
        
    },
    dropLine: function() {
        
    },
    blurFocus: function(e) {
        const line = e.target.parent.parent;
        console.log(line); // @TODO pack line and save
    },
    saveRepart: function(moduleId, mode, nb, timeby, groups) {
        
    },
    dropRepart: function() {
        
    },
    checkRedondancy: function() {
        const tot = {};
        const redondant = {};
        document.querySelector('#reparts tr').forEach((e) => {
            let moduleId = e.querySelector('.repart_line_module select[name="module"]').value;
            let mode = e.querySelector('.repart_line_mode select[name="mode"]').value;
            let k = `${moduleId}_${mode}`;
            if(!tot.hasOwnProperty(k)) { tot[k] = 0; }
            else { redondant[k] = {'module': moduleId, 'mode': mode}; }
            tot[k]++;
        });
        OverviewServices.updateStatus('Un ou plusieurs modules sont en doublon', OverviewServices.STATUS_ERR);
        for(let r of redondant) {
            
        }
    },
    updateStatus: function(txt, status) {
        
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
