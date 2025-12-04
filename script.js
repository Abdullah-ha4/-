document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");
  const welcomeMsg = document.getElementById("welcome");
  const logoutBtn = document.getElementById("logoutBtn");
  const medForm = document.getElementById("medicineForm");
  const medTable = document.getElementById("medTable");
  const dashWelcome = document.getElementById("dashWelcome");
  const logoutDashBtn = document.getElementById("logoutDashBtn");
  const medCount = document.getElementById("medCount");
  const medTotal = document.getElementById("medTotal");
  const medChart = document.getElementById("medChart");

  // ======================
  // حماية لوحة التحكم + إحصائيات
  // ======================
  if (dashWelcome || logoutDashBtn) {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
      alert("🚫 يجب تسجيل الدخول للوصول إلى لوحة التحكم.");
      window.location.href = "login.html";
    } else {
      dashWelcome.textContent = `مرحباً، ${loggedInUser.name} 👋`;

      const medicines = JSON.parse(localStorage.getItem("medicines")) || [];
      if (medCount) medCount.textContent = medicines.length;
      if (medTotal) {
        let totalQty = medicines.reduce((sum, med) => sum + Number(med.quantity), 0);
        medTotal.textContent = totalQty;
      }

      // رسم بياني بالأدوية والكميات
      if (medChart) {
        const ctx = medChart.getContext("2d");
        new Chart(ctx, {
          type: "bar",
          data: {
            labels: medicines.map(m => m.name),
            datasets: [{
              label: "كمية الأدوية",
              data: medicines.map(m => m.quantity),
              backgroundColor: "rgba(0, 150, 136, 0.6)"
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: { beginAtZero: true }
            }
          }
        });
      }
    }
  }

  if (logoutDashBtn) {
    logoutDashBtn.addEventListener("click", () => {
      localStorage.removeItem("loggedInUser");
      window.location.href = "login.html";
    });
  }

  // ======================
  // حماية صفحة إدارة الأدوية
  // ======================
  if (medForm || medTable) {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
      alert("🚫 يجب تسجيل الدخول أولاً للوصول إلى صفحة إدارة الأدوية.");
      window.location.href = "login.html";
      return;
    }
  }

  // ======================
  // إنشاء حساب جديد
  // ======================
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      localStorage.setItem("user", JSON.stringify({ name, email, password }));

      document.getElementById("message").style.color = "green";
      document.getElementById("message").textContent = "✅ تم إنشاء الحساب بنجاح!";
      signupForm.reset();
    });
  }

  // ======================
  // تسجيل الدخول
  // ======================
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value;
      const password = document.getElementById("loginPassword").value;
      const user = JSON.parse(localStorage.getItem("user"));

      if (user && user.email === email && user.password === password) {
        localStorage.setItem("loggedInUser", JSON.stringify(user));
        document.getElementById("loginMessage").style.color = "green";
        document.getElementById("loginMessage").textContent = "✅ تم تسجيل الدخول بنجاح!";

        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 2000);
      } else {
        document.getElementById("loginMessage").style.color = "red";
        document.getElementById("loginMessage").textContent = "❌ البريد أو كلمة المرور غير صحيحة!";
      }
    });
  }

  // ======================
  // الصفحة الرئيسية (عرض اسم المستخدم)
  // ======================
  if (welcomeMsg) {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedInUser) {
      welcomeMsg.textContent = `مرحباً، ${loggedInUser.name} 👋`;
      logoutBtn.style.display = "inline-block";
    }
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("loggedInUser");
      window.location.reload();
    });
  }

  // ======================
  // إدارة الأدوية (CRUD)
  // ======================
  function renderMedicines() {
    const medicines = JSON.parse(localStorage.getItem("medicines")) || [];
    const tbody = medTable.querySelector("tbody");
    tbody.innerHTML = "";

    medicines.forEach((med, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${med.name}</td>
        <td>${med.price}</td>
        <td>${med.quantity}</td>
        <td>
          <button class="btn" onclick="editMedicine(${index})">تعديل</button>
          <button class="btn" onclick="deleteMedicine(${index})">حذف</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  if (medForm) {
    medForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("medName").value;
      const price = document.getElementById("medPrice").value;
      const quantity = document.getElementById("medQuantity").value;

      let medicines = JSON.parse(localStorage.getItem("medicines")) || [];
      medicines.push({ name, price, quantity: Number(quantity) });
      localStorage.setItem("medicines", JSON.stringify(medicines));

      medForm.reset();
      renderMedicines();
    });

    renderMedicines();
  }

  // ======================
  // تعديل وحذف الأدوية
  // ======================
  window.editMedicine = function(index) {
    let medicines = JSON.parse(localStorage.getItem("medicines")) || [];
    const med = medicines[index];

    const newName = prompt("أدخل اسم الدواء الجديد:", med.name);
    const newPrice = prompt("أدخل السعر الجديد:", med.price);
    const newQuantity = prompt("أدخل الكمية الجديدة:", med.quantity);

    if (newName && newPrice && newQuantity) {
      medicines[index] = { name: newName, price: newPrice, quantity: Number(newQuantity) };
      localStorage.setItem("medicines", JSON.stringify(medicines));
      renderMedicines();
    }
  }

  window.deleteMedicine = function(index) {
    let medicines = JSON.parse(localStorage.getItem("medicines")) || [];
    if (confirm("هل تريد حذف هذا الدواء؟")) {
      medicines.splice(index, 1);
      localStorage.setItem("medicines", JSON.stringify(medicines));
      renderMedicines();
    }
  }
});