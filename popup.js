document.getElementById('summarizeBtn').addEventListener('click', async () => {
  const loading = document.getElementById('loading');
  const summaryText = document.getElementById('summaryText');

  loading.style.display = 'block';
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
      loading.textContent = "⚠️ Chrome Prompt API not available in this browser.";
      return;
    }

    const availability = await LanguageModel.availability();
    console.log("AI model status:", availability);

    if (availability !== "available") {
      loading.textContent = "⚙️ Model is not yet ready. Please wait for Gemini Nano to finish downloading.";
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
        legend: { display: type !== "bar" },
        tooltip: {
        callbacks: {
          label: function(context) {
          return `${context.label}: ${context.parsed.y ?? context.parsed}`;
          }
        }
        }
      },
      scales: type === "bar" || type === "line" ? {
        y: {
        beginAtZero: true,
        max: 10,
        title: { display: true, text: "Importance" }
        }
      } : {}
      }
    });
    charts.push(chart);
  });
}

function clearCharts() {
  charts.forEach(c => c.destroy());
  charts = [];
}
