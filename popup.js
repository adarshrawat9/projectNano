document.getElementById('summarizeBtn').addEventListener('click', async () => {
  const loading = document.getElementById('loading');
  const summaryText = document.getElementById('summaryText');

  loading.style.display = 'block';
  loading.innerText="Generating Visualization...."
  summaryText.textContent = '';
  clearCharts();

  // Get text from current page
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const [{ result: pageText }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => document.body.innerText.slice(0, 5000)
  });

  try {
    // ✅ Check if the AI Prompt API is available
    if (!LanguageModel.availability()) {
      loading.textContent = " Chrome Prompt API not available in this browser.";
      return;
    }

    const availability = await LanguageModel.availability();
    console.log("AI model status:", availability);

    if (availability !== "available") {
      loading.textContent = " Model is not yet ready. Please wait for Gemini Nano to finish downloading.";
      return;
    }

    // ✅ Create AI session
    const session = await LanguageModel.create({
      systemPrompt: "You are a helpful assistant that summarizes webpage text and extracts 4 key topics with importance scores."
    });

    const prompt = `
      Summarize this text in 3-4 lines and extract 4 key topics with their importance (0-10 scale):
      ${pageText}
      Output format (JSON):
      {
        "summary": "...",
        "keywords": ["..."],
        "scores": [0,0,0,0]
      }
    `;

    const response = await session.prompt(prompt);
    console.log("Raw AI response:", response);
    const parsed = parseJSON(response);

    if (!parsed) throw new Error("Failed to parse AI response.");

    loading.style.display = 'none';
    summaryText.textContent = parsed.summary;

    drawCharts(parsed.keywords, parsed.scores);
  } catch (err) {
    loading.textContent = "❌ Error: " + err.message;
  }
  
});

function parseJSON(text) {
  try {
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    return JSON.parse(text.slice(jsonStart, jsonEnd + 1));
  } catch {
    return null;
  }
}

let charts = [];
function drawCharts(labels, values) {
  const chartConfigs = [
    { id: "barChart", type: "bar" },
    { id: "pieChart", type: "pie" },
    { id: "lineChart", type: "line" }
  ];

  chartConfigs.forEach(({ id, type }) => {
    const ctx = document.getElementById(id).getContext("2d");
    const chart = new Chart(ctx, {
      type,
      data: {
      labels,
      datasets: [{
        label: "Importance",
        data: values,
        borderWidth: 2,
        backgroundColor: labels.map((_, i) =>
        `hsl(${i * 90}, 70%, 60%)`
        ),
        borderColor: labels.map((_, i) =>
        `hsl(${i * 90}, 70%, 40%)`
        ),
        fill: type === "line"
      }]
      },
      options: {
      responsive: true,
      plugins: {
        legend: {
        display: type !== "bar",
        labels: {
          color: "#fff" // Set legend text to white
        }
        },
        tooltip: {
        callbacks: {
          label: function(context) {
          return `${context.label}: ${context.parsed.y ?? context.parsed}`;
          }
        },
        backgroundColor: "#222",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#fff"
        }
      },
      scales: type === "bar" || type === "line" ? {
        x: {
        ticks: { color: "#fff" }, // X axis labels white
        title: { color: "#fff" },
        grid: { color: "#fff" }, // X axis grid lines white
        border: { color: "#fff" } // X axis border white
        },
        y: {
        beginAtZero: true,
        max: 10,
        title: { display: true, text: "Importance", color: "#fff" },
        ticks: { color: "#fff" }, // Y axis labels white
        grid: { color: "#fff" }, // Y axis grid lines white
        border: { color: "#fff" } // Y axis border white
        }
      } : {}
      }
     
    });

    // Add a single download button for all charts (only once)
    if (!document.getElementById("all-charts-download-btn")) {
      const downloadBtn = document.createElement("button");
      downloadBtn.id = "all-charts-download-btn";
      downloadBtn.textContent = "Download All Charts";
      // Insert after the last chart
      const lastChartElem = document.getElementById(chartConfigs[chartConfigs.length - 1].id);
      lastChartElem.parentNode.insertBefore(downloadBtn, lastChartElem.nextSibling);

      downloadBtn.onclick = () => {
      charts.forEach((chart, idx) => {
        const link = document.createElement("a");
        link.href = chart.toBase64Image();
        link.download = `${chartConfigs[idx].id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
      });
      };
    }


    charts.push(chart);
  });
}


function clearCharts() {
  charts.forEach(c => c.destroy());
  charts = [];
  const downloadBtn = document.getElementById("all-charts-download-btn");
  if (downloadBtn) {
    downloadBtn.remove();
  }
}

document.getElementById('summarizeOnlyBtn').addEventListener('click', async () => {
  const loading = document.getElementById('loading');
  loading.innerText="Generating Summary.....";
  const summaryText = document.getElementById('summaryText');

  loading.style.display = 'block';
  summaryText.textContent = '';
  clearCharts();

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const [{ result: pageText }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => document.body.innerText.slice(0, 5000)
  });

  try {
    if (!LanguageModel.availability()) {
      loading.textContent = " Chrome Prompt API not available in this browser.";
      return;
    }

    const availability = await LanguageModel.availability();
    if (availability !== "available") {
      loading.textContent = " Model is not yet ready. Please wait for Gemini Nano to finish downloading.";
      return;
    }

    const session = await LanguageModel.create({
      systemPrompt: "You are a helpful assistant that summarizes webpage text."
    });

    const prompt = `
      Summarize this text in 20-25 lines, capturing more details and context:
      ${pageText}
      Output format (JSON):
      {
        "summary": "..."
      }
    `;

    const response = await session.prompt(prompt);
    const parsed = parseJSON(response);

    if (!parsed) throw new Error("Failed to parse AI response.");

    loading.style.display = 'none';
    summaryText.textContent = parsed.summary;
  } catch (err) {
    loading.textContent = "❌ Error: " + err.message;
  }
});



