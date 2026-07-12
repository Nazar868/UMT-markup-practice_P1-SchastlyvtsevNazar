(function () {
  "use strict";

  var API_URL = window.FLORA_API;

  /* =========================================================
     Order modal (Block 2)
     ========================================================= */
  var backdrop = document.getElementById("orderModal");

  if (backdrop) {
    var modal = backdrop.querySelector(".modal");
    var closeBtn = document.getElementById("orderModalClose");
    var titleEl = document.getElementById("orderModalTitle");
    var bouquetInput = document.getElementById("orderBouquetName");
    var form = document.getElementById("orderForm");
    var statusEl = document.getElementById("orderFormStatus");
    var agreeInput = document.getElementById("orderAgree");
    var lastFocused = null;

    var openModal = function (bouquetName) {
      lastFocused = document.activeElement;
      titleEl.textContent = bouquetName
        ? 'Order "' + bouquetName + '"'
        : "Request a Bouquet";
      bouquetInput.value = bouquetName || "";
      statusEl.className = "modal__status";
      statusEl.textContent = "";

      backdrop.classList.add("is-open");
      document.body.classList.add("no-scroll");

      var firstField = form.querySelector("input:not([type=hidden])");
      if (firstField) firstField.focus();
    };

    var closeModal = function () {
      backdrop.classList.remove("is-open");
      document.body.classList.remove("no-scroll");
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    };

    // Any element with .js-order-btn opens the modal (bestsellers +
    // dynamically rendered catalogue cards).
    document.addEventListener("click", function (event) {
      var trigger = event.target.closest(".js-order-btn");
      if (!trigger) return;
      event.preventDefault();
      openModal(trigger.dataset.bouquet || "");
    });

    closeBtn.addEventListener("click", closeModal);

    // Close on backdrop click, but not on clicks inside the modal itself.
    backdrop.addEventListener("click", function (event) {
      if (event.target === backdrop) closeModal();
    });

    window.addEventListener("keyup", function (event) {
      if (event.key === "Escape" && backdrop.classList.contains("is-open")) {
        closeModal();
      }
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!agreeInput.checked) {
        statusEl.textContent =
          "Please accept the license agreement to continue.";
        statusEl.className = "modal__status modal__status--error is-visible";
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var payload = {
        bouquet: bouquetInput.value,
        name: document.getElementById("orderName").value,
        email: document.getElementById("orderEmail").value,
        phone: document.getElementById("orderPhone").value,
        message: document.getElementById("orderMessage").value,
        createdAt: new Date().toISOString(),
      };

      submitBtn.disabled = true;

      sendOrder(payload)
        .then(function () {
          statusEl.textContent =
            "Thank you! We will contact you shortly to confirm the order.";
          statusEl.className =
            "modal__status modal__status--success is-visible";
          form.reset();
          window.setTimeout(closeModal, 1600);
        })
        .catch(function () {
          statusEl.textContent =
            "Something went wrong while sending your request. Please make sure the mock API is running and try again.";
          statusEl.className = "modal__status modal__status--error is-visible";
        })
        .finally(function () {
          submitBtn.disabled = false;
        });
    });
  }

  async function sendOrder(payload) {
    await axios.post(API_URL + "/requests", payload);
  }

  /* =========================================================
     Newsletter subscribe form (Block 2)
     ========================================================= */
  var subscribeForm = document.getElementById("subscribeForm");

  if (subscribeForm) {
    var subscribeStatus = document.getElementById("subscribeStatus");

    subscribeForm.addEventListener("submit", function (event) {
      event.preventDefault();

      var emailInput = document.getElementById("subscribeEmail");
      var submitBtn = subscribeForm.querySelector('button[type="submit"]');

      submitBtn.disabled = true;

      subscribeEmail(emailInput.value)
        .then(function () {
          subscribeStatus.textContent =
            "Thanks for subscribing! Check your inbox for a confirmation.";
          subscribeStatus.classList.add("is-visible");
          subscribeForm.reset();
        })
        .catch(function () {
          subscribeStatus.textContent =
            "Couldn't subscribe right now. Please try again later.";
          subscribeStatus.classList.add("is-visible");
        })
        .finally(function () {
          submitBtn.disabled = false;
        });
    });
  }

  async function subscribeEmail(email) {
    await axios.post(API_URL + "/subscribers", {
      email: email,
      createdAt: new Date().toISOString(),
    });
  }
})();
