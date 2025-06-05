window.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm'); // poate lipsi pe profile.html, ok
  const dashboard = document.getElementById('dashboard');
  const addForm = document.getElementById('addForm');
  const productList = document.getElementById('productList');
  const logoutBtn = document.getElementById('logoutBtn');
  const searchBox = document.getElementById('searchBox');
  const categoryFilter = document.getElementById('categoryFilter');

  // Dacă e pagina login, ascunde dashboard
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      fetch('../api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem('currentUser', username);
          localStorage.setItem('currentRole', data.role || "user");
          window.location.href = 'profile.html';
        } else {
          alert("Login failed: " + data.message);
        }
      });
    });
  }

  // Dacă e pagina profil, ascultă formularul de adăugat produs
  if (addForm) {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('productName').value;
      const qty = parseInt(document.getElementById('productQty').value);
      const category = document.getElementById('productCategory').value;
      const added_by = localStorage.getItem('currentUser');

      fetch('../api/add_product.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, quantity: qty, category, added_by })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert(data.message);
          loadProducts();
          addForm.reset();
          if (typeof updateStatistics === 'function') updateStatistics();
        } else {
          alert("Error: " + data.message);
        }
      });
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      dashboard.classList.add('hidden');
      if (loginForm) loginForm.classList.remove('hidden');
      productList.innerHTML = '';
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentRole');
      window.location.href = 'index.html';
    });
  }

  if (searchBox) {
    searchBox.addEventListener('input', filterProducts);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', filterProducts);
  }

  function filterProducts() {
    const searchValue = searchBox.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const user = localStorage.getItem('currentUser');

    fetch(`../api/get_products.php?user=${encodeURIComponent(user)}`)
      .then(res => res.json())
      .then(products => {
        productList.innerHTML = '';
        products
          .filter(p =>
            p.name.toLowerCase().includes(searchValue) &&
            (selectedCategory === '' || p.category === selectedCategory)
          )
          .forEach(p => addProductToList(p.name, p.quantity, p.id, p.category));
      });
  }

  function loadProducts() {
    const user = localStorage.getItem('currentUser');

    fetch(`../api/get_products.php?user=${encodeURIComponent(user)}`)
      .then(res => res.json())
      .then(products => {
        productList.innerHTML = '';
        if (!products || products.length === 0) {
          productList.innerHTML = "<li>No products available.</li>";
          return;
        }
        products.forEach(p => {
          addProductToList(p.name, p.quantity, p.id, p.category);
        });
      });
  }

  function addProductToList(name, qty, id = null, category = "") {
    const li = document.createElement('li');
    li.textContent = `${name} - ${qty} pcs (${category})`;
    if (qty < 5) {
      li.style.color = 'red';
      li.textContent += ' ⚠️ Low stock';
    }

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Update';
    editBtn.style.marginLeft = '10px';
    editBtn.onclick = () => editProduct(id);
    li.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.style.marginLeft = '5px';
    deleteBtn.onclick = () => deleteProduct(id);
    li.appendChild(deleteBtn);

    productList.appendChild(li);
  }

  function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    fetch('../api/delete_product.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert(data.message);
        loadProducts();
        if (typeof updateStatistics === 'function') updateStatistics();
      } else {
        alert("Error: " + data.message);
      }
    })
    .catch(() => alert("Network error."));
  }

  function editProduct(id) {
    const newQty = prompt("Enter new quantity:");
    if (newQty === null || isNaN(newQty)) return;

    fetch('../api/update_product.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, quantity: parseInt(newQty) })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert(data.message || "Product updated.");
        loadProducts();
        if (typeof updateStatistics === 'function') updateStatistics();
      } else {
        alert("Error: " + data.message);
      }
    });
  }

  // La încărcarea paginii, încarcă produsele dacă dashboard există
  if (dashboard) {
    loadProducts();
    dashboard.classList.remove('hidden');
    if (loginForm) loginForm.classList.add('hidden');
  }
});
