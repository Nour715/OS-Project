const state = {
    processes: [],
    quantum: 0,
    lastResults: null
};

const el = {};

const scenarios = {
    a: {
        label: "Scenario A loaded: Basic mixed workload",
        quantum: 3,
        processes: [
            { id: "P1", at: 0, bt: 7 },
            { id: "P2", at: 1, bt: 4 },
            { id: "P3", at: 2, bt: 1 },
            { id: "P4", at: 3, bt: 5 }
        ]
    },
    b: {
        label: "Scenario B loaded: Quantum sensitivity case",
        quantum: 2,
        processes: [
            { id: "P1", at: 0, bt: 8 },
            { id: "P2", at: 1, bt: 4 },
            { id: "P3", at: 2, bt: 9 },
            { id: "P4", at: 3, bt: 5 }
        ]
    },
    c: {
        label: "Scenario C loaded: Short-job-heavy case",
        quantum: 4,
        processes: [
            { id: "P1", at: 0, bt: 9 },
            { id: "P2", at: 1, bt: 2 },
            { id: "P3", at: 2, bt: 1 },
            { id: "P4", at: 3, bt: 2 },
            { id: "P5", at: 4, bt: 1 }
        ]
    },
    d: {
        label: "Scenario D loaded: Interactive fairness case",
        quantum: 2,
        processes: [
            { id: "P1", at: 0, bt: 6 },
            { id: "P2", at: 0, bt: 6 },
            { id: "P3", at: 0, bt: 6 },
            { id: "P4", at: 1, bt: 3 }
        ]
    },
    e: {
        label: "Scenario E loaded: Invalid values. Run validation to see errors",
        quantum: 2,
        processes: [
            { id: "P1", at: 0, bt: 5 },
            { id: "P2", at: -1, bt: 3 },
            { id: "P3", at: 2, bt: 0 }
        ]
    }
};

function byId(id) {
    return document.getElementById(id);
}

function setStatus(message, type = "") {
    el.statusLabel.textContent = message;
    el.statusLabel.className = `status-label ${type}`.trim();
}

function showInput() {
    el.outputSection.classList.add("hidden");
    el.inputSection.classList.remove("hidden");
    setStatus("Ready");
}

function showOutput() {
    el.inputSection.classList.add("hidden");
    el.outputSection.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function clearAll() {
    state.processes = [];
    state.quantum = 0;
    state.lastResults = null;
    el.numProcessesInput.value = "";
    el.timeQuantumInput.value = "";
    el.processTbody.innerHTML = "";
    el.processForm.classList.add("hidden");
    setStatus("Form cleared");
}

function validateInitialInputs() {
    const count = Number.parseInt(el.numProcessesInput.value, 10);
    const quantum = Number.parseInt(el.timeQuantumInput.value, 10);
    let valid = true;

    el.numProcessesInput.classList.remove("input-error");
    el.timeQuantumInput.classList.remove("input-error");

    if (!Number.isInteger(count) || count < 1 || count > 10) {
        el.numProcessesInput.classList.add("input-error");
        valid = false;
    }

    if (!Number.isInteger(quantum) || quantum < 1) {
        el.timeQuantumInput.classList.add("input-error");
        valid = false;
    }

    if (!valid) {
        setStatus("Enter processes from 1 to 10 and quantum greater than 0", "error");
        return null;
    }

    state.quantum = quantum;
    return count;
}

function createProcessRows(count, data = []) {
    el.processTbody.innerHTML = "";

    for (let i = 0; i < count; i++) {
        const process = data[i] || { at: "", bt: "" };
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>P${i + 1}</td>
            <td><input type="number" class="at-input" min="0" value="${process.at}" placeholder="0" aria-label="Arrival time for P${i + 1}"></td>
            <td><input type="number" class="bt-input" min="1" value="${process.bt}" placeholder="1" aria-label="Burst time for P${i + 1}"></td>
        `;
        el.processTbody.appendChild(row);
    }

    el.processForm.classList.remove("hidden");
}

function handleGenerateTable() {
    const count = validateInitialInputs();
    if (!count) return;
    createProcessRows(count);
    setStatus(`${count} processes table generated`, "success");
}

function loadScenario(key) {
    const scenario = scenarios[key];
    el.numProcessesInput.value = scenario.processes.length;
    el.timeQuantumInput.value = scenario.quantum;
    state.quantum = scenario.quantum;
    createProcessRows(scenario.processes.length, scenario.processes);
    setStatus(scenario.label, key === "e" ? "error" : "success");
}

function collectProcesses() {
    const rows = [...el.processTbody.querySelectorAll("tr")];
    const processes = [];
    let valid = true;

    rows.forEach((row, index) => {
        row.classList.remove("row-error");
        const atInput = row.querySelector(".at-input");
        const btInput = row.querySelector(".bt-input");
        const at = Number.parseInt(atInput.value, 10);
        const bt = Number.parseInt(btInput.value, 10);

        if (!Number.isInteger(at) || at < 0 || !Number.isInteger(bt) || bt <= 0) {
            row.classList.add("row-error");
            valid = false;
            return;
        }

        processes.push({ id: `P${index + 1}`, at, bt });
    });

    if (!valid) {
        setStatus("Invalid input. Arrival must be 0 or more. Burst must be greater than 0", "error");
        return null;
    }

    return processes.sort((a, b) => a.at - b.at || numericId(a.id) - numericId(b.id));
}

function numericId(id) {
    return Number.parseInt(String(id).replace(/\D/g, ""), 10) || 0;
}

function cloneProcesses(processes) {
    return processes.map(process => ({ ...process }));
}

function runRoundRobin(input, quantum) {
    const processes = cloneProcesses(input).sort((a, b) => a.at - b.at || numericId(a.id) - numericId(b.id));
    const result = processes.map(process => ({
        ...process,
        remaining: process.bt,
        startTime: null,
        ct: 0,
        tat: 0,
        wt: 0,
        rt: 0
    }));

    const gantt = [];
    const queueHistory = [];
    const queue = [];
    let time = 0;
    let completed = 0;
    let index = 0;

    while (completed < result.length) {
        while (index < result.length && result[index].at <= time) {
            queue.push(result[index]);
            index++;
        }

        if (queue.length === 0) {
            const nextArrival = result[index]?.at;
            if (nextArrival === undefined) break;
            if (time < nextArrival) {
                gantt.push({ id: "Idle", start: time, end: nextArrival });
                time = nextArrival;
            }
            continue;
        }

        queueHistory.push({
            time,
            queue: queue.map(process => process.id)
        });

        const current = queue.shift();
        if (current.startTime === null) {
            current.startTime = time;
            current.rt = time - current.at;
        }

        const slice = Math.min(quantum, current.remaining);
        gantt.push({ id: current.id, start: time, end: time + slice });
        time += slice;
        current.remaining -= slice;

        while (index < result.length && result[index].at <= time) {
            queue.push(result[index]);
            index++;
        }

        if (current.remaining > 0) {
            queue.push(current);
        } else {
            current.ct = time;
            current.tat = current.ct - current.at;
            current.wt = current.tat - current.bt;
            completed++;
        }
    }

    const final = finalizeResult(result, gantt, false);
    final.queueHistory = queueHistory;
    return final;
}

function runSRTF(input) {
    const result = cloneProcesses(input)
        .sort((a, b) => a.at - b.at || numericId(a.id) - numericId(b.id))
        .map(process => ({
            ...process,
            remaining: process.bt,
            startTime: null,
            ct: 0,
            tat: 0,
            wt: 0,
            rt: 0
        }));

    const gantt = [];
    let time = 0;
    let completed = 0;
    let currentId = null;
    let blockStart = 0;

    while (completed < result.length) {
        const ready = result
            .filter(process => process.at <= time && process.remaining > 0)
            .sort((a, b) => a.remaining - b.remaining || a.at - b.at || numericId(a.id) - numericId(b.id));

        if (ready.length === 0) {
            const nextArrival = result
                .filter(process => process.remaining > 0)
                .reduce((min, process) => Math.min(min, process.at), Infinity);

            if (nextArrival === Infinity) break;
            if (currentId !== null) {
                gantt.push({ id: currentId, start: blockStart, end: time });
                currentId = null;
            }
            if (time < nextArrival) {
                gantt.push({ id: "Idle", start: time, end: nextArrival });
            }
            time = nextArrival;
            blockStart = time;
            continue;
        }

        const current = ready[0];

        if (currentId !== current.id) {
            if (currentId !== null) {
                gantt.push({ id: currentId, start: blockStart, end: time });
            }
            currentId = current.id;
            blockStart = time;
        }

        if (current.startTime === null) {
            current.startTime = time;
            current.rt = time - current.at;
        }

        current.remaining--;
        time++;

        if (current.remaining === 0) {
            current.ct = time;
            current.tat = current.ct - current.at;
            current.wt = current.tat - current.bt;
            completed++;
            gantt.push({ id: current.id, start: blockStart, end: time });
            currentId = null;
            blockStart = time;
        }
    }

    return finalizeResult(result, gantt);
}

function finalizeResult(processes, gantt, shouldMergeGantt = true) {
    const cleanProcesses = processes
        .map(({ remaining, startTime, ...process }) => process)
        .sort((a, b) => numericId(a.id) - numericId(b.id));

    return {
        processes: cleanProcesses,
        gantt: shouldMergeGantt ? mergeGantt(gantt) : cleanGantt(gantt),
        averages: calculateAverages(cleanProcesses)
    };
}

function cleanGantt(gantt) {
    return gantt
        .filter(block => block.end > block.start)
        .map(block => ({ ...block }));
}

function mergeGantt(gantt) {
    const merged = [];
    gantt.forEach(block => {
        if (block.end <= block.start) return;
        const last = merged[merged.length - 1];
        if (last && last.id === block.id && last.end === block.start) {
            last.end = block.end;
        } else {
            merged.push({ ...block });
        }
    });
    return merged;
}

function calculateAverages(processes) {
    const totals = processes.reduce((acc, process) => {
        acc.ct += process.ct;
        acc.tat += process.tat;
        acc.wt += process.wt;
        acc.rt += process.rt;
        return acc;
    }, { ct: 0, tat: 0, wt: 0, rt: 0 });

    const n = processes.length;
    return {
        ct: totals.ct / n,
        tat: totals.tat / n,
        wt: totals.wt / n,
        rt: totals.rt / n
    };
}

function format(value) {
    return Number(value).toFixed(2);
}

function renderProcessTable(prefix, result) {
    const tbody = byId(`${prefix}-tbody`);
    tbody.innerHTML = "";

    result.processes.forEach(process => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${process.id}</td>
            <td>${process.at}</td>
            <td>${process.bt}</td>
            <td>${process.ct}</td>
            <td>${process.tat}</td>
            <td>${process.wt}</td>
            <td>${process.rt}</td>
        `;
        tbody.appendChild(row);
    });
}

function renderAverages(prefix, averages) {
    const averagesDiv = byId(`${prefix}-averages`);
    averagesDiv.innerHTML = `
        <div class="avg-box"><div class="avg-label">Average TAT</div><div class="avg-value">${format(averages.tat)}</div></div>
        <div class="avg-box"><div class="avg-label">Average WT</div><div class="avg-value">${format(averages.wt)}</div></div>
        <div class="avg-box"><div class="avg-label">Average RT</div><div class="avg-value">${format(averages.rt)}</div></div>
    `;
}

function renderGantt(containerId, gantt) {
    const container = byId(containerId);
    container.innerHTML = "";

    gantt.forEach((block, index) => {
        const item = document.createElement("div");
        item.className = `gantt-block ${block.id === "Idle" ? "idle" : ""}`;
        item.style.flexGrow = String(Math.max(1, block.end - block.start));
        item.innerHTML = `
            <span class="gantt-pid">${block.id}</span>
            ${index === 0 ? `<span class="gantt-time start-time">${block.start}</span>` : ""}
            <span class="gantt-time">${block.end}</span>
        `;
        container.appendChild(item);
    });
}

function renderReadyQueue(history) {
    const container = byId("rr-queue-view");
    if (!container) return;
    container.innerHTML = "";

    history.forEach(item => {
        const row = document.createElement("div");
        row.className = "queue-row";
        row.innerHTML = `
            <span class="queue-time">t=${item.time}</span>
            <span class="queue-items">${item.queue.length ? item.queue.join(" → ") : "Empty"}</span>
        `;
        container.appendChild(row);
    });
}

function renderComparison(rr, srtf) {
    const rows = [
        { name: "Average Waiting Time", key: "wt", lowWins: true },
        { name: "Average Turnaround Time", key: "tat", lowWins: true },
        { name: "Average Response Time", key: "rt", lowWins: true }
    ];

    el.comparisonTbody.innerHTML = "";

    rows.forEach(row => {
        const rrValue = rr.averages[row.key];
        const srtfValue = srtf.averages[row.key];
        let better = "Tie";

        if (rrValue < srtfValue) better = "Round Robin";
        if (srtfValue < rrValue) better = "SRTF";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${row.name}</td>
            <td>${format(rrValue)}</td>
            <td>${format(srtfValue)}</td>
            <td><span class="better-tag">${better}</span></td>
        `;
        el.comparisonTbody.appendChild(tr);
    });
}

function renderConclusion(rr, srtf) {
    const betterWT = rr.averages.wt < srtf.averages.wt ? "Round Robin" : srtf.averages.wt < rr.averages.wt ? "SRTF" : "Both algorithms";
    const betterTAT = rr.averages.tat < srtf.averages.tat ? "Round Robin" : srtf.averages.tat < rr.averages.tat ? "SRTF" : "Both algorithms";
    const betterRT = rr.averages.rt < srtf.averages.rt ? "Round Robin" : srtf.averages.rt < rr.averages.rt ? "SRTF" : "Both algorithms";

    const rrSlices = rr.gantt.filter(block => block.id !== "Idle").length;
    const srtfSlices = srtf.gantt.filter(block => block.id !== "Idle").length;

    el.finalConclusion.innerHTML = `
        <p><strong>Waiting time:</strong> ${betterWT} gave the better average waiting time.</p>
        <p><strong>Turnaround time:</strong> ${betterTAT} gave the better average turnaround time.</p>
        <p><strong>Response time:</strong> ${betterRT} gave the better average response time.</p>
        <p><strong>Fairness:</strong> Round Robin shares CPU time using the selected quantum ${state.quantum}. Smaller quantum improves response sharing but increases context switching.</p>
        <p><strong>Efficiency:</strong> SRTF usually finishes short jobs faster because it always selects the process with the shortest remaining burst time.</p>
        <p><strong>Execution pattern:</strong> Round Robin used ${rrSlices} execution blocks. SRTF used ${srtfSlices} execution blocks.</p>
    `;
}

function renderAll(rr, srtf) {
    renderProcessTable("rr", rr);
    renderAverages("rr", rr.averages);
    renderGantt("rr-gantt", rr.gantt);
    renderReadyQueue(rr.queueHistory || []);

    renderProcessTable("srtf", srtf);
    renderAverages("srtf", srtf.averages);
    renderGantt("srtf-gantt", srtf.gantt);

    renderComparison(rr, srtf);
    renderConclusion(rr, srtf);
    el.runInfo.textContent = `${state.processes.length} processes compared. Time quantum = ${state.quantum}.`;
}

function handleSubmit(event) {
    event.preventDefault();

    const count = validateInitialInputs();
    if (!count) return;

    const processes = collectProcesses();
    if (!processes) return;

    state.processes = processes;
    const rr = runRoundRobin(processes, state.quantum);
    const srtf = runSRTF(processes);
    state.lastResults = { rr, srtf };

    renderAll(rr, srtf);
    setStatus("Comparison completed successfully", "success");
    showOutput();
}


function setupEnterNavigation() {
    document.addEventListener("keydown", event => {
        if (event.key !== "Enter" || event.target.tagName !== "INPUT") return;
        const inputs = [...document.querySelectorAll("input")].filter(input => !input.disabled && input.offsetParent !== null);
        const index = inputs.indexOf(event.target);
        if (index >= 0 && index < inputs.length - 1) {
            event.preventDefault();
            inputs[index + 1].focus();
        }
    });
}

function setupEvents() {
    el.generateTableBtn.addEventListener("click", handleGenerateTable);
    el.clearBtn.addEventListener("click", clearAll);
    el.processForm.addEventListener("submit", handleSubmit);
    el.runAgainBtn.addEventListener("click", showInput);

    document.querySelectorAll(".scenario-btn").forEach(button => {
        button.addEventListener("click", () => loadScenario(button.dataset.scenario));
    });

    setupEnterNavigation();
}

function cacheElements() {
    el.inputSection = byId("input-section");
    el.outputSection = byId("output-section");
    el.statusLabel = byId("status-label");
    el.numProcessesInput = byId("num-processes");
    el.timeQuantumInput = byId("time-quantum");
    el.generateTableBtn = byId("generate-table-btn");
    el.clearBtn = byId("clear-btn");
    el.processForm = byId("process-form");
    el.processTbody = byId("process-tbody");
    el.runAgainBtn = byId("run-again-btn");
    el.comparisonTbody = byId("comparison-tbody");
    el.finalConclusion = byId("final-conclusion");
    el.runInfo = byId("run-info");
}

document.addEventListener("DOMContentLoaded", () => {
    cacheElements();
    setupEvents();
});
