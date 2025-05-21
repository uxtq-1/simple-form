// script.js (complete, replacing previous version)
let currentStep = 0;
const steps = document.querySelectorAll(".form-step");
const progress = document.getElementById("progress");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const form = document.getElementById("shippingForm");

function showStep(step) {
  steps.forEach((s, index) => {
    s.classList.toggle("active", index === step);
  });
  progress.style.width = `${(step / (steps.length - 1)) * 100}%`;
  prevBtn.classList.toggle("hidden", step === 0);
  nextBtn.textContent = step === steps.length - 1 ? "Submit" : "Next";
}

function validateStep(step) {
  const inputs = steps[step].querySelectorAll("input[required], select[required]");
  return Array.from(inputs).every(input => input.value.trim() !== "");
}

// In script.js, replace the nextBtn event listener with this
nextBtn.addEventListener("click", async () => {
  if (validateStep(currentStep)) {
    if (currentStep < steps.length - 1) {
      currentStep++;
      showStep(currentStep);
    } else {
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      const jsonData = JSON.stringify(data);
      const encodedData = btoa(jsonData);
      console.log("Sending data:", encodedData); // Debug: Check encoded data
      try {
        const response = await fetch("https://script.google.com/macros/s/AKfycbz3n9BkuBmofRa4uZELv2MbWGY0aUXqXecT8C-7H7rAnf3WGd_oYj10UBwo19n02K2aiQ/exec", {
          method: "POST",
          body: encodedData,
          headers: { "Content-Type": "text/plain" }
        });
        const result = await response.text();
        console.log("Response:", result); // Debug: Check server response
        alert(result);
        if (result === "Success") {
          form.reset();
          currentStep = 0;
          showStep(currentStep);
        }
      } catch (err) {
        console.error("Submission error:", err);
        alert("Failed to submit form: " + err.message);
      }
    }
  } else {
    alert("Please fill all required fields.");
  }
});

prevBtn.addEventListener("click", () => {
  if (currentStep > 0) {
    currentStep--;
    showStep(currentStep);
  }
});

// Camera Functionality
let stream = null;

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    const video = document.getElementById("video");
    video.srcObject = stream;
    video.style.display = "block";
  } catch (err) {
    console.error("Camera error:", err);
    alert("Failed to access camera.");
  }
}

function capturePhoto() {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const photoPreview = document.getElementById("photoPreview");
  const photoData = document.getElementById("photoData");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);
  photoPreview.src = canvas.toDataURL("image/png");
  photoPreview.style.display = "block";
  photoData.value = photoPreview.src; // Store Base64 image
  video.style.display = "none";
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
}

// Barcode Scanning
function scanBarcode() {
  const barcodeScanner = document.getElementById("barcodeScanner");
  barcodeScanner.style.display = "block";
  Quagga.init({
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: barcodeScanner,
      constraints: { facingMode: "environment" }
    },
    decoder: { readers: ["code_128_reader", "ean_reader", "qr_reader"] }
  }, err => {
    if (err) {
      console.error("Quagga error:", err);
      alert("Failed to initialize barcode scanner.");
      return;
    }
    Quagga.start();
  });

  Quagga.onDetected(data => {
    document.getElementById("barcodeData").value = data.codeResult.code;
    barcodeScanner.style.display = "none";
    Quagga.stop();
  });
}

// Initialize
showStep(currentStep);
