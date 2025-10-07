document.getElementById("addProcess").addEventListener("click", () => {
  let table = document.querySelector("#processTable tbody");
  let row = document.createElement("tr");

  row.innerHTML = `
    <td><input type="text" value="P${table.rows.length + 1}"></td>
    <td><input type="number" value="0"></td>
    <td><input type="number" value="1"></td>
  `;
  table.appendChild(row);
});

document.getElementById("simulate").addEventListener("click", () => {
  let rows = document.querySelectorAll("#processTable tbody tr");
  let processes = [];

  rows.forEach(row => {
    let pid = row.cells[0].querySelector("input").value;
    let at = parseInt(row.cells[1].querySelector("input").value);
    let bt = parseInt(row.cells[2].querySelector("input").value);
    processes.push({ pid, at, bt });
  });

  // Sort by Arrival Time
  processes.sort((a, b) => a.at - b.at);

  let time = 0, results = [];
  let ganttContainer = document.getElementById("ganttChart");
  ganttContainer.innerHTML = "";

  // Wrap Gantt Chart for pointer
  ganttContainer.innerHTML = `<div id="ganttWrapper"></div>`;
  let wrapper = document.getElementById("ganttWrapper");

  let totalBurst = processes.reduce((sum, p) => sum + p.bt, 0);

  processes.forEach((p, index) => {
    if (time < p.at) time = p.at;
    let start = time;
    let finish = start + p.bt;
    let tat = finish - p.at;
    let wt = tat - p.bt;
    results.push({ pid: p.pid, wt, tat });

    // Horizontal block width = burst time
    let block = document.createElement("div");
    block.className = "gantt-block";
    block.style.width = `${p.bt * 50}px`; // 50px per burst unit
    block.style.animationDelay = `${index * 0.7}s`;
    block.innerHTML = `${p.pid}`;
    wrapper.appendChild(block);

    time = finish;
  });

  // CPU Pointer setup
  let pointer = document.createElement("div");
  pointer.id = "cpuPointer";
  wrapper.appendChild(pointer);

  // Show pointer after Gantt blocks load
  setTimeout(() => {
    pointer.style.display = "block";
    let wrapperWidth = wrapper.offsetWidth;
    pointer.animate(
      [
        { transform: "translateX(0px)" },
        { transform: `translateX(${wrapperWidth - 5}px)` }
      ],
      {
        duration: totalBurst * 1000, // 1s per burst unit
        iterations: 1,
        easing: "linear"
      }
    );
  }, processes.length * 700);

  // Display Results
  let tbody = document.querySelector("#resultTable tbody");
  tbody.innerHTML = "";
  let totalWT = 0, totalTAT = 0;
  results.forEach(r => {
    tbody.innerHTML += `
      <tr>
        <td>${r.pid}</td>
        <td>${r.wt}</td>
        <td>${r.tat}</td>
      </tr>
    `;
    totalWT += r.wt;
    totalTAT += r.tat;
  });

  let n = results.length;
  document.getElementById("avgTimes").innerText =
    `Average Waiting Time = ${(totalWT / n).toFixed(2)}, Average Turnaround Time = ${(totalTAT / n).toFixed(2)}`;
});
