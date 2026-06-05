const socket = io();

// 1. Chart Initialization
const ctx = document.getElementById('myChart').getContext('2d');
let myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            { label: 'Revenue (₹)', data: [], borderColor: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.1)', borderWidth: 2, yAxisID: 'y' },
            { label: 'Users', data: [], borderColor: '#06b6d4', backgroundColor: 'rgba(6, 182, 212, 0.1)', borderWidth: 2, yAxisID: 'y1' },
            { label: 'Orders', data: [], borderColor: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderWidth: 2, yAxisID: 'y1' }
        ]
    },
    options: { responsive: true, scales: { y: { type: 'linear', display: true, position: 'left' }, y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } } } }
});

// FEATURE: Custom Dashboard Layout Component Selector
function customizeLayout() {
    const viewSelection = document.getElementById("chartViewFilter").value;
    if (viewSelection === "revenue") {
        myChart.setDatasetVisibility(0, true);  // Revenue Visible
        myChart.setDatasetVisibility(1, false); // Users Hidden
        myChart.setDatasetVisibility(2, false); // Orders Hidden
    } else if (viewSelection === "operations") {
        myChart.setDatasetVisibility(0, false);
        myChart.setDatasetVisibility(1, true);
        myChart.setDatasetVisibility(2, true);
    } else {
        myChart.setDatasetVisibility(0, true);
        myChart.setDatasetVisibility(1, true);
        myChart.setDatasetVisibility(2, true);
    }
    myChart.update();
}

// Socket Processing and FEATURE: KPI Target Monitoring Engine
socket.on("metrics", (data) => {
    if (!data || !data.totals || !data.timeline) return;

    // Display basic operational values
    document.getElementById("revenue-card").innerText = `` + parseFloat(data.totals.revenue).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
    document.getElementById("users-card").innerText = data.totals.users;
    document.getElementById("orders-card").innerText = data.totals.orders;

    // KPI Evaluation Engine
    const targetRevenueThreshold = parseFloat(document.getElementById("revenueThresholdInput").value) || 0;
    const currentRevenueSum = parseFloat(data.totals.revenue || 0);
    const revenueLabel = document.getElementById("revenue-status");

    if (currentRevenueSum >= targetRevenueThreshold) {
        revenueLabel.innerText = "🎯 Target Reached!";
        revenueLabel.className = "kpi-status status-good";
    } else {
        revenueLabel.innerText = `⚠️ Deficit: ${(targetRevenueThreshold - currentRevenueSum).toFixed(2)} under target`;
        revenueLabel.className = "kpi-status status-critical";
    }

    // Process Timeline Arrays for Graphic Canvas Rendering
    myChart.data.labels = data.timeline.map(item => new Date(item.created_at).toLocaleTimeString());
    myChart.data.datasets[0].data = data.timeline.map(item => parseFloat(item.revenue || 0));
    myChart.data.datasets[1].data = data.timeline.map(item => parseInt(item.users || 0));
    myChart.data.datasets[2].data = data.timeline.map(item => parseInt(item.orders || 0));
    myChart.update();
});

// FEATURE: Data Import From Multiple Sources Simulation Client
async function importMockSource(sourceIdentifier) {
    const logContainer = document.getElementById("import-log");
    logContainer.innerText = `Contacting standard handler for [${sourceIdentifier}]...`;

    try {
        const response = await fetch('/api/metrics/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ source: sourceIdentifier })
        });
        const statusReport = await response.json();
        logContainer.innerText = `✅ Success: Added batch row ID #${statusReport.id} from connection context: ${sourceIdentifier}`;
    } catch (err) {
        logContainer.innerText = `❌ Connection issue: ` + err.message;
    }
}

// FEATURE: Exportable Reports Fetch Engine
function exportReport(formatType) {
    window.open(`/api/metrics/export?format=${formatType}`, '_blank');
}