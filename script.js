async function submitForm() {
  alert("Submitting...");

  const formEl = document.getElementById("shippingForm");
  const formData = Object.fromEntries(new FormData(formEl).entries());
  console.log("Form Data:", formData);

  const encryptedData = btoa(JSON.stringify(formData));
  console.log("Encrypted:", encryptedData);

  const GOOGLE_WEBHOOK = "https://script.google.com/macros/s/AKfycbz3n9BkuBmofRa4uZELv2MbWGY0aUXqXecT8C-7H7rAnf3WGd_oYj10UBwo19n02K2aiQ/exec";

  try {
    const res = await fetch(GOOGLE_WEBHOOK, {
      method: "POST",
      body: encryptedData
    });
    const msg = await res.text();
    alert("Submitted: " + msg);
    formEl.reset();
    localStorage.clear();
    currentStep = 0;
    updateFormStep();
  } catch (err) {
    alert("Error submitting form: " + err.message);
  }
}
