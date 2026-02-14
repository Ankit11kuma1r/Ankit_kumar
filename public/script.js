const spinBtn = document.getElementById('spinBtn');
const discountResult = document.getElementById('discountResult');
const discountPercentInput = document.getElementById('discountPercent');
const orderForm = document.getElementById('orderForm');
const formMessage = document.getElementById('formMessage');
const useLocationBtn = document.getElementById('useLocationBtn');
const allowLocationBtn = document.getElementById('allowLocationBtn');
const closeLocationModalBtn = document.getElementById('closeLocationModalBtn');
const locationModal = document.getElementById('locationModal');
const locationMessage = document.getElementById('locationMessage');
const deliveryAddress = document.getElementById('deliveryAddress');
const openOrderModalBtn = document.getElementById('openOrderModalBtn');
const closeOrderModalBtn = document.getElementById('closeOrderModalBtn');
const orderModal = document.getElementById('orderModal');

const discountOptions = [2, 3, 5, 7, 10, 12, 15];
let spinUsed = false;

function openModal(modal) {
  modal.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function closeModal(modal) {
  modal.classList.add('hidden');
  if (document.querySelectorAll('.modal:not(.hidden)').length === 0) {
    document.body.classList.remove('modal-open');
  }
}

openOrderModalBtn.addEventListener('click', () => openModal(orderModal));
closeOrderModalBtn.addEventListener('click', () => closeModal(orderModal));

useLocationBtn.addEventListener('click', () => openModal(locationModal));
closeLocationModalBtn.addEventListener('click', () => closeModal(locationModal));

allowLocationBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    locationMessage.textContent = 'Geolocation is not supported in your browser.';
    locationMessage.className = 'error';
    return;
  }

  locationMessage.textContent = 'Fetching your location...';
  locationMessage.className = '';

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const exactLocation = `Latitude: ${latitude}, Longitude: ${longitude}`;
      deliveryAddress.value = exactLocation;
      locationMessage.textContent = 'Location added to delivery address successfully.';
      locationMessage.className = 'success';
      closeModal(locationModal);
      openModal(orderModal);
      deliveryAddress.focus();
    },
    () => {
      locationMessage.textContent = 'Location permission denied or unavailable.';
      locationMessage.className = 'error';
    }
  );
});

spinBtn.addEventListener('click', () => {
  if (spinUsed) return;

  const discount = discountOptions[Math.floor(Math.random() * discountOptions.length)];
  discountResult.textContent = `Congratulations! You won ${discount}% discount on your monthly bill.`;
  discountPercentInput.value = discount;
  spinUsed = true;
  spinBtn.disabled = true;
});

orderForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  formMessage.textContent = 'Submitting your order...';

  const formData = new FormData(orderForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to place order');
    }

    formMessage.textContent = `${data.message} Your order ID is #${data.orderId}.`;
    formMessage.className = 'success';
    orderForm.reset();
    discountPercentInput.value = '0';
    spinUsed = false;
    spinBtn.disabled = false;
    discountResult.textContent = 'No discount unlocked yet.';
  } catch (error) {
    formMessage.textContent = error.message;
    formMessage.className = 'error';
  }
});

window.addEventListener('click', (event) => {
  if (event.target === locationModal) closeModal(locationModal);
  if (event.target === orderModal) closeModal(orderModal);
});
