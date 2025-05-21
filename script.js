let currentStep = 1;
const steps = document.querySelectorAll(".form-step");
const nextBtn = document.getElementById("nextStep");
const prevBtn = document.getElementById("prevStep");

function showStep(step) {
  steps.forEach(s => s.classList.remove("active"));
  document.querySelector(`[data-step="${step}"]`).classList.add("active");
  prevBtn.style.display = step === 1 ? "none" : "inline-block";
  nextBtn.style.display = step === steps.length ? "none" : "inline-block";
}

nextBtn.addEventListener("click", () => {
  if (currentStep < steps.length) currentStep++;
  showStep(currentStep);
});

prevBtn.addEventListener("click", () => {
  if (currentStep > 1) currentStep--;
  showStep(currentStep);
});

showStep(currentStep);

// Autofill from localStorage
document.getElementById('shippingForm').addEventListener('input', (e) => {
  localStorage.setItem(e.target.name, e.target.value);
});

window.addEventListener('load', () => {
  const inputs = document.querySelectorAll('#shippingForm input, select, textarea');
  inputs.forEach(input => {
    if (localStorage.getItem(input.name)) {
      input.value = localStorage.getItem(input.name);
    }
  });
});

// Camera functionality
let stream = null;
async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.getElementById("video");
    video.srcObject = stream;
    video.style.display = "block";
  } catch (err) {
    alert("Camera error: " + err.message);
  }
}

function capturePhoto() {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageData = canvas.toDataURL("image/png");
  document.getElementById("photoPreview").src = imageData;
  document.getElementById("photoPreview").style.display = "block";
  document.getElementById("photoData").value = imageData;

  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  video.style.display = "none";
}

// Barcode scanning with QuaggaJS
function scanBarcode() {
  document.getElementById("barcodeScanner").style.display = "block";

  Quagga.init({
    inputStream: {
      type: "LiveStream",
      target: document.getElementById("barcodeScanner"),
      constraints: { facingMode: "environment" }
    },
    decoder: {
      readers: ["code_128_reader", "ean_reader", "qr_reader"]
    }
  }, (err) => {
    if (err) return console.error(err);
    Quagga.start();
  });

  Quagga.onDetected((data) => {
    const code = data.codeResult.code;
    document.getElementById("barcodeData").value = code;
    alert("Barcode: " + code);
    Quagga.stop();
    document.getElementById("barcodeScanner").style.display = "none";
  });
}

// Google Sheets or Microsoft Graph API
const GOOGLE_WEBHOOK = ""; // e.g. https://script.google.com/macros/s/XXXXX/exec
const MICROSOFT_GRAPH_URL = ""; // e.g. https://graph.microsoft.com/v1.0/me/drive/items/{item-id}/workbook/worksheets/Sheet1/tables/Table1/rows/add
const USE_MICROSOFT_GRAPH = false;

document.getElementById("shippingForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target).entries());
  const encryptedData = btoa(JSON.stringify(formData));

  if (USE_MICROSOFT_GRAPH) {
    const bearerToken = "YOUR_MS_GRAPH_ACCESS_TOKEN"; // Auth required
    const payload = {
      values: [Object.values(formData)]
    };

    try {
      const res = await fetch(MICROSOFT_GRAPH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      alert("Excel Success: " + JSON.stringify(json));
    } catch (err) {
      alert("Error sending to Excel: " + err.message);
    }
  } else {
    try {
      const res = await fetch(GOOGLE_WEBHOOK, {
        method: "POST",
        body: encryptedData
      });
      const msg = await res.text();
      alert("Submitted to Google Sheets: " + msg);
    } catch (err) {
      alert("Error sending to Google Sheets: " + err.message);
    }
  }
});
