let currentStep = 0;
const steps = document.querySelectorAll(".form-step");
const progress = document.getElementById("progress");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const form = document.getElementById("shippingForm");

function showStep(step) {
  steps.forEach((s, index) => s.classList.toggle("active", index === step));
  progress.style.width = `${(step / (steps.length - 1)) * 100}%`;
  prevBtn.classList.toggle("hidden", step === 0);
  nextBtn.textContent = step === steps.length - 1 ? "Submit" : "Next";
}

function validateStep(step) {
  const inputs = steps[step].querySelectorAll("input[required], select[required]");
  return Array.from(inputs).every(input => input.value.trim() !== "");
}

nextBtn.addEventListener("click", async () => {
  if (!validateStep(currentStep)) {
    alert("Please fill in all required fields on this step.");
    return;
  }

  if (currentStep < steps.length - 1) {
    currentStep++;
    showStep(currentStep);
  } else {
    await submitForm();
  }
});

prevBtn.addEventListener("click", () => {
  if (currentStep > 0) {
    currentStep--;
    showStep(currentStep);
  }
});

showStep(currentStep);

// Autofill
form.addEventListener('input', (e) => {
  localStorage.setItem(e.target.name, e.target.value);
});

window.addEventListener('load', () => {
  const inputs = form.querySelectorAll("input, select, textarea");
  inputs.forEach(input => {
    const saved = localStorage.getItem(input.name);
    if (saved) input.value = saved;
  });
});

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

// Submit
async function submitForm() {
  alert("Submitting form...");
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  const encodedData = btoa(JSON.stringify(data));

  const GOOGLE_WEBHOOK = "https://script.google.com/macros/s/AKfycbzpCPCPwM_TnM3uAegoALnzhwsG82IVyK3Xvm-udSkpVqg_hXwpOPim8ohs70H8wGQ3/exec";

  try {
    const res = await fetch(GOOGLE_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: encodedData
    });

    const result = await res.text();
    alert("Submitted: " + result);
    form.reset();
    localStorage.clear();
    currentStep = 0;
    showStep(currentStep);
  } catch (err) {
    alert("Error submitting form: " + err.message);
  }
}
