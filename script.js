let currentStep = 0;
const steps = document.querySelectorAll(".form-step");
const progress = document.getElementById("progress");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

function updateFormStep() {
  steps.forEach((step, index) => {
    step.classList.toggle("active", index === currentStep);
  });

  // Update progress bar
  const stepPercent = ((currentStep + 1) / steps.length) * 100;
  progress.style.width = `${stepPercent}%`;

  // Update nav buttons
  prevBtn.classList.toggle("hidden", currentStep === 0);
  nextBtn.textContent = currentStep === steps.length - 1 ? "Submit" : "Next";
}

nextBtn.addEventListener("click", () => {
  if (currentStep < steps.length - 1) {
    currentStep++;
    updateFormStep();
  } else {
    submitForm();
  }
});

prevBtn.addEventListener("click", () => {
  if (currentStep > 0) {
    currentStep--;
    updateFormStep();
  }
});

updateFormStep();

// Save to localStorage
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

// Camera functions
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

// Barcode scanner
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

// Submit function
async function submitForm() {
  const formData = Object.fromEntries(new FormData(document.getElementById("ShippingFormResponses")).entries());
  const encrypted = btoa(JSON.stringify(formData));

  const GOOGLE_WEBHOOK = "https://script.google.com/macros/s/AKfycbx3KZurx8EIYSaZuTsQOQTwnhvVl6ITJeNzc2cXgCj4/dev"; // Replace this

  try {
    const res = await fetch(GOOGLE_WEBHOOK, {
      method: "POST",
      body: encrypted
    });
    const msg = await res.text();
    alert("Submitted successfully: " + msg);
  } catch (err) {
    alert("Submission failed: " + err.message);
  }
}
