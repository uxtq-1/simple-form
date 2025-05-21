let currentStep = 0;
const steps = document.querySelectorAll(".form-step");
const progress = document.getElementById("progress");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

function updateFormStep() {
  steps.forEach((step, index) => {
    step.classList.toggle("active", index === currentStep);
  });

  const stepPercent = ((currentStep + 1) / steps.length) * 100;
  progress.style.width = `${stepPercent}%`;

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

// Autofill
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

// Camera Functions
let stream = null;
async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    const video = document.getElementById("video");
    video.srcObject = stream;
    video.style.display = "block";
  } catch (err) {
    alert("Camera access denied or unavailable.");
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

// Barcode Scanner
function scanBarcode() {
  document.getElementById("barcodeScanner").style.display = "block";

  Quagga.init({
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: document.getElementById("barcodeScanner"),
      constraints: { facingMode: "environment" }
    },
    decoder: {
      readers: ["code_128_reader", "ean_reader", "qr_reader"]
    }
  }, function (err) {
    if (err) {
      console.error(err);
      alert("Failed to start barcode scanner.");
      return;
    }
    Quagga.start();
  });

  Quagga.onDetected(function (data) {
    const code = data.codeResult.code;
    document.getElementById("barcodeData").value = code;
    alert("Scanned: " + code);
    Quagga.stop();
    document.getElementById("barcodeScanner").style.display = "none";
  });
}

// Submit Form
async function submitForm() {
  const formData = Object.fromEntries(new FormData(document.getElementById("1k_6fFQdmArDJKQC24IV0XEiZVZMQlMepdHes_Mc8ipw")).entries());
  const encryptedData = btoa(JSON.stringify(formData));

  const GOOGLE_WEBHOOK = "https://script.google.com/macros/s/AKfycbz3n9BkuBmofRa4uZELv2MbWGY0aUXqXecT8C-7H7rAnf3WGd_oYj10UBwo19n02K2aiQ/exec"; // Replace this

  try {
    const res = await fetch(GOOGLE_WEBHOOK, {
      method: "POST",
      body: encryptedData
    });
    const msg = await res.text();
    alert("Submitted: " + msg);
  } catch (err) {
    alert("Error submitting form: " + err.message);
  }
}
