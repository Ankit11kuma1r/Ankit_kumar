const tbody = document.getElementById('ordersTableBody');
const refreshBtn = document.getElementById('refreshBtn');

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function loadOrders() {
  tbody.innerHTML = '<tr><td colspan="10">Loading orders...</td></tr>';

  try {
    const response = await fetch('/api/orders');
    const orders = await response.json();

    if (!response.ok) throw new Error('Failed to fetch orders');

    if (!orders.length) {
      tbody.innerHTML = '<tr><td colspan="10">No orders yet.</td></tr>';
      return;
    }

    tbody.innerHTML = orders
      .map(
        (order) => `
          <tr>
            <td>${escapeHtml(order.id)}</td>
            <td>${escapeHtml(order.customerName)}</td>
            <td>${escapeHtml(order.email)}<br>${escapeHtml(order.phone)}</td>
            <td>${escapeHtml(order.address)}</td>
            <td>${escapeHtml(order.quantityLiters)}</td>
            <td>${escapeHtml(order.deliveryTime)}</td>
            <td>${escapeHtml(order.milkType)}</td>
            <td>${escapeHtml(order.discountPercent)}%</td>
            <td>${escapeHtml(order.notes || '-')}</td>
            <td>${new Date(order.createdAt).toLocaleString()}</td>
          </tr>
      `
      )
      .join('');
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="10">${escapeHtml(error.message)}</td></tr>`;
  }
}

refreshBtn.addEventListener('click', loadOrders);
loadOrders();
