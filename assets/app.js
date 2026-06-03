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
    STATUS_ERR: 'error',
    trainingId: null,
    sessionId: null,
    semesterId: null,
    data: null, // because of how our keys work, we need to recompute everything every time, and let the back handle it
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
                    let k = `${moduleId}_${mode}`;
                    OverviewServices.data[k] = l; // at this point, no redundancy should happen YET
                }
            });
        });
    },
    clearLines: function() {
        document.getElement('reparts').innerHTML = '';
        OverviewServices.data = {};
    },
    addLine: function() {
        const tpl = document.importNode(document.querySelector('tpl_repartline').content, true);
        OverviewServices.bindLineEvents(tpl);
        document.getElementById('reparts').appendChild(tpl);
    },
    bindLineEvents: function(tpl) {
        tpl.querySelectorAll('select,input').forEach((e) => {
            e.addEventListener('change', blurFocus);
        });
    },
    addFilledLine: function(lineData) {
        const tpl = document.importNode(document.querySelector('tpl_repartline').content, true);
        tpl.querySelector('.repart_line_ue').innerText = lineData.unitName;
        tpl.querySelector('.repart_line_module select[name="module"]').value = lineData.teaching_module_id;
        tpl.querySelector('.repart_line_mode select[name="mode"]').value = lineData.mode_id;
        tpl.querySelector('.repart_line_nb select[name="nb"]').value = lineData.nb;
        tpl.querySelector('.repart_line_nbgroups select[name="groups"]').value = lineData.groups;
        tpl.querySelector('.repart_line_hperg select[name="timeby"]').value = lineData.timeby;
        tpl.querySelector('tr').dataset.specific = (null != lineData.session_id);
        OverviewServices.bindLineEvents(tpl);
        document.getElementById('reparts').appendChild(tpl);
    },
    dropLine: function(ev) {
        if(OverviewServices.checkRedundancy()) { // if everything was fine, dropping will be effective now
            e = ev.target.parent.parent;
            let module = e.querySelector('.repart_line_module select[name="module"]').value;
            let mode = e.querySelector('.repart_line_mode select[name="mode"]').value;
            if(module && mode) {
                OverviewServices.dropRepart(e, module, mode);
            }
        } else { // we need to cook
            OverviewServices.saveAllReparts();
        }
    },
    blurFocus: function(ev) {
        const line = ev.target.parent.parent;
        OverviewServices.checkLine(line);
    },
    checkLine: function(el) {
        let isValid = false;
        let moduleId = el.querySelector('.repart_line_module select[name="module"]').value;
        let mode = el.querySelector('.repart_line_mode select[name="mode"]').value;
        isValid = (moduleId && mode);
        isValid = isValid && OverviewServices.checkRedundancy();
        if(isValid) {
            OverviewServices.saveAllReparts();
        }
    },
    dropRepart: function(line, moduleId, modeId) {
        const training = OverviewServices.trainingId;
        const session = OverviewServices.sessionId;
        const semester = OverviewServices.semesterId;
        fetch(`/reparts/${training}/${session}/${semester}/drop`, {
            'method': 'POST',
            'headers': {
                'Content-Type': 'application/json',
            },
            'body': JSON.stringify({'teaching': moduleId, 'mode': modeId})
        }).then((r) => {
            r.json((res) => {
                if(res.deleted) {
                    let k = `${moduleId}_${modeId}`;
                    delete OverviewServices.data[k];
                    line.outerHTML = '';
                }
            });
        });
    },
    saveAllReparts: function() {
        
    },
    checkRedundancy: function() {
        let isRedondant = false;
        const tot = {};
        const redondant = {};
        document.querySelector('#reparts tr').forEach((e) => {
            let moduleId = e.querySelector('.repart_line_module select[name="module"]').value;
            let mode = e.querySelector('.repart_line_mode select[name="mode"]').value;
            let k = `${moduleId}_${mode}`;
            if(!tot.hasOwnProperty(k)) {
                tot[k] = 0;
                e.classList.remove('error');
            } else {
                redondant[k] = e;
                e.classList.add('error');
                isRedondant = true;
            }
            tot[k]++;
        });
        if(isRedondant) {
            OverviewServices.updateStatus('Un ou plusieurs modules sont en doublon', OverviewServices.STATUS_ERR);
        } else {
            OverviewServices.updateStatus('Cohérence vérifiée, sauvegarde automatique', OverviewServices.STATUS_TXT);
        }
        return isRedondant;
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
