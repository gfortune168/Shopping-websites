// 1. 定義預設商品資料
const defaultProducts = [
    { id: 1, name: "阿里山高山青茶", price: 600, image: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=500" },
    { id: 2, name: "凍頂烏龍茶", price: 850, image: "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=500" },
    { id: 3, name: "日月潭紅玉紅茶", price: 1200, image: "https://images.unsplash.com/photo-1544787210-2213d2426687?w=500" },
    { id: 4, name: "手採金萱茶", price: 550, image: "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=500" }
];

// 2. 從 localStorage 取得商品，若無則存入預設值
let products = JSON.parse(localStorage.getItem('tea_products'));

if (!products || products.length === 0) {
    products = defaultProducts;
    localStorage.setItem('tea_products', JSON.stringify(products));
}

// --- 新增：初始化預設帳號邏輯 ---
(function() {
    let users = JSON.parse(localStorage.getItem('users')) || [];

    // 1. 設定管理員 (admin)
    const adminIndex = users.findIndex(u => u.email === 'admin');
    const defaultAdmin = {
        name: "超級管理員",    // 在這裡改管理員顯示名稱
        email: "admin",      // 在這裡改管理員帳號
        password: "admin123",     // 在這裡改管理員密碼
        role: "ADMIN"
    };

    if (adminIndex === -1) {
        users.push(defaultAdmin);
    } else {
        // 如果你想強制每次重新整理都覆蓋舊密碼，可以取消註解下一行
        // users[adminIndex] = defaultAdmin; 
    }

    // 2. 設定一般使用者 (user)
    const userIndex = users.findIndex(u => u.email === 'user');
    const defaultUser = {
        name: "一般會員",      // 在這裡改一般會員名稱
        email: "user",       // 在這裡改一般會員帳號
        password: "user123",      // 在這裡改一般會員密碼
        role: "USER"
    };

    if (userIndex === -1) {
        users.push(defaultUser);
    }

    localStorage.setItem('users', JSON.stringify(users));
})();
// ----------------------------


// 3. 渲染商品的函數
// 修改 main.js 裡的 displayProducts 函式
function displayProducts(isAdmin = false) {
    const productList = document.getElementById('product-list');
    if (!productList) return;

    productList.innerHTML = products.map(product => {
        // 根據權限決定按鈕 HTML
        const actionButtons = isAdmin ? 
            `<div style="display: flex; gap: 5px; margin-top: 10px;">
                <button class="btn-secondary" style="background:#C5A059; flex:1; color:white; border:none; padding:8px;" onclick="editProduct(${product.id})">修改</button>
                <button class="btn-secondary" style="background:#d9534f; flex:1; color:white; border:none; padding:8px;" onclick="deleteProduct(${product.id})">下架</button>
            </div>` : 
            `<div class="quantity-control">
                <button onclick="changeQty(${product.id}, -1)">-</button>
                <input type="number" id="qty-${product.id}" value="1" min="1">
                <button onclick="changeQty(${product.id}, 1)">+</button>
            </div>
            <button class="add-to-cart" onclick="addToCart(${product.id})">加入購物車</button>`;

        return `
            <div class="product-card">
                <div class="img-container">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-note">${product.note || '精選台灣好茶'}</p>
                    <div class="price-tag">NT$ ${product.price}</div>
                    ${actionButtons}
                </div>
            </div>
        `;
    }).join('');
}

// 3. 會員資料的函數
// main.js
function displayMembers() {
    const memberList = document.getElementById('member-list-container');
    if (!memberList) return;

    let users = JSON.parse(localStorage.getItem('users')) || [];

    memberList.innerHTML = `
        <div class="member-grid">
            ${users.map(user => `
                <div class="member-card">
                    <div class="card-item"><strong>姓名:</strong> <span>${user.name}</span></div>
                    <div class="card-item"><strong>帳號:</strong> <span>${user.email}</span></div>
                    <div class="card-item"><strong>最後登入:</strong> <span style="color:#2D5A27;">${user.lastLogin || '尚未登入'}</span></div>
                    
                    <div class="card-item"><strong>電話:</strong> <span>${user.phone || '未填'}</span></div>
                    <div class="card-item"><strong>權限:</strong> <span class="role-badge">${user.role}</span></div>
                    <div class="card-actions">
                        <button onclick="adminEditUser('${user.email}')" class="btn-edit small-btn">修改</button>
                        <button onclick="adminDeleteUser('${user.email}')" class="btn-delete small-btn">刪除</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// 網頁載入後執行
// 修改 window.onload
// --- 修改點 2 ---
window.onload = function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        checkRole(currentUser); // 這裡會根據權限顯示 admin-panel
        
        // 如果是管理員，綁定「會員資料紀錄」按鈕的點擊事件
        if (currentUser.role === 'ADMIN') {
            const memberBtn = document.querySelector('button[onclick="displayMembers()"]');
            if (memberBtn) {
                memberBtn.onclick = function() {
                    document.getElementById('member-records').style.display = 'block';
                    displayMembers(); // 點擊按鈕才執行渲染
                };
            }
        }
    }
};


// 核心初始化函式
function initApp() {
    const savedProducts = localStorage.getItem('tea_products');
    // 如果 localStorage 有資料就用它的，沒有才用預設的
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    } else {
        products = defaultProducts;
        localStorage.setItem('tea_products', JSON.stringify(defaultProducts));
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.role === 'ADMIN') {
        enterShop();
        showAllProducts();
    }
}

// 確保網頁載入後執行
window.addEventListener('load', initApp);


// 通用的切換頁面函式
function showSection(sectionId) {
    const sections = ['login-section', 'register-section', 'forgot-section', 'profile-section', 'shop-section', 'admin-section'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = (id === sectionId) ? 'block' : 'none';
    });
}

// 1. 會員註冊邏輯
function register() {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const phone = document.getElementById('reg-phone').value;
    const address = document.getElementById('reg-address').value;
    const birthday = document.getElementById('reg-birthday').value;

    // 1. 檢查欄位是否填寫完整
    if (!name || !email || !password || !phone || !address || !birthday) {
        alert("所有欄位均為必填！");
        return;
    }

    // 2. 密碼強度檢查 (必須包含特殊符號)
    const specialChars = /[!@#$%^&*(),.?":{}|<>]/;
    if (!specialChars.test(password)) {
        alert("註冊失敗：密碼必須包含至少一個特殊符號 (如 !@#$%^&*)");
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];

    // 3. 檢查帳號是否重複
    if (users.find(u => u.email === email)) {
        alert("此 Email 已被註冊過！");
        return;
    }

    // 4. 建立新會員資料 (包含所有細節)
    const newUser = {
        name: name,
        email: email,
        password: password,
        phone: phone,
        address: address,
        birthday: birthday,
        role: 'user', // 預設權限
        lastLogin: "新註冊(尚未登入)", // 初始文字
        joinDate: new Date().toLocaleDateString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    alert("註冊成功！請使用新帳號登入。");
    showAuthSection('login-form-container'); // 註冊成功後自動跳轉回登入畫面
}


function login(email, password) {
    // 1. 取得所有註冊會員資料
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // 2. 尋找匹配的帳號密碼
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        // 登入成功：存入當前登入者資訊
        localStorage.setItem('currentUser', JSON.stringify(user));
        alert('登入成功！歡迎回來 ' + user.name);
        
        // 3. 登入後自動導向「立即訂購」頁面 (或是重新整理)
        window.location.reload(); 
        return true;
    } else {
        alert('帳號或密碼錯誤，請重新輸入');
        return false;
    }
}


// 修正後的註冊功能
function handleRegister() {
    // 獲取輸入值 (確保 ID 與 HTML 一致)
    const name = document.getElementById('reg-name').value;
    const birthday = document.getElementById('reg-birthday').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const address = document.getElementById('reg-address').value;
    const phone = document.getElementById('reg-phone').value;
    const mobile = document.getElementById('reg-mobile').value;

    const newUser = {
        name: name,
        email: email,
        password: password,
        birthday: birthday,
        phone: phone || mobile,
        address: address,
        role: 'user',
        lastLogin: "新註冊(尚未登入)" // 給予初始文字，避免顯示為空白
    };

    let users = JSON.parse(localStorage.getItem('users')) || [];
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    alert("註冊成功！請使用新帳號登入。");
    
    if (typeof displayMembers === 'function') {
        displayMembers();
    }
    showAuthSection('login-form-container');
}

// 修正後的找回密碼功能
function handleFindPassword() {
    const email = document.getElementById('forgot-email').value;
    const mobile = document.getElementById('forgot-mobile').value;

    if (!email || !mobile) {
        alert("請輸入 Email 與手機號碼以供核對");
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.mobile === mobile);

    if (user) {
        alert(`核對成功！您的密碼是：${user.password}`);
        showAuthSection('login-form-container');
    } else {
        alert("資料核對失敗，請檢查 Email 或手機號碼是否正確");
    }
}

// --- 修正後的登入觸發邏輯 ---
document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('login-submit');
    if (loginBtn) {
        loginBtn.onclick = function() {
            const emailInput = document.getElementById('username').value;
            const passwordInput = document.getElementById('password').value;
            
            if (!emailInput || !passwordInput) {
                alert("請輸入帳號密碼");
                return;
            }
            
            // 執行登入
            executeLogin(emailInput, passwordInput);
        };
    }
});

function executeLogin(email, password) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    // 1. 使用 findIndex 找到該會員在陣列中的位置
    const userIndex = users.findIndex(u => u.email === email && u.password === password);

    if (userIndex !== -1) {
        // 2. 取得當前時間字串
        const now = new Date().toLocaleString('zh-TW', { hour12: false });

        // 3. 更新該會員的最後登入時間
        users[userIndex].lastLogin = now;

        // 4. 將更新後的完整會員清單存回 localStorage
        localStorage.setItem('users', JSON.stringify(users));

        // 5. 更新當前登入者資訊 (currentUser)
        localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));

        alert('登入成功！歡迎回來 ' + users[userIndex].name);
        window.location.reload(); 
    } else {
        alert('帳號或密碼錯誤，請重新輸入');
    }
}

// 3. 修改資料邏輯 (需舊密碼驗證)
function handleUpdateProfile() {
    const email = document.getElementById('edit-email').value;
    const oldPassword = document.getElementById('edit-old-password').value;
    let users = JSON.parse(localStorage.getItem('users')) || [];

    const index = users.findIndex(u => u.email === email && u.password === oldPassword);
    
    if (index === -1) {
        alert("帳號或舊密碼錯誤，無法修改");
        return;
    }

    // 更新資料
    const newName = document.getElementById('edit-name').value;
    const newPass = document.getElementById('edit-new-password').value;
    const newAddr = document.getElementById('edit-address').value;
    const newMob = document.getElementById('edit-mobile').value;

    if (newName) users[index].name = newName;
    if (newPass) users[index].password = newPass;
    if (newAddr) users[index].address = newAddr;
    if (newMob) users[index].mobile = newMob;

    localStorage.setItem('users', JSON.stringify(users));
    alert("資料更新完畢，請重新登入");
    showAuthSection('login-form-container');
}

// 切換登入彈窗內的子介面
function showAuthSection(sectionId) {
    const sections = ['login-form-container', 'register-section', 'forgot-section', 'profile-section'];
    
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            // 切換時只顯示選中的 ID，其餘隱藏
            el.style.display = (id === sectionId) ? 'block' : 'none';
        }
    });
}

function adminDeleteUser(email) {
    if (confirm(`確定要永久刪除會員 ${email} 嗎？此動作無法復原。`)) {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users = users.filter(u => u.email !== email); // 過濾掉該 Email
        localStorage.setItem('users', JSON.stringify(users));
        
        alert("會員帳號已成功刪除");
        displayMembers(); // 重新整理列表
    }
}

function adminEditUser(email) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) return;

    const newName = prompt("請輸入新的會員姓名:", users[userIndex].name);
    const newPass = prompt("請輸入新的會員密碼:", users[userIndex].password);

    if (newName !== null && newPass !== null) {
        users[userIndex].name = newName;
        users[userIndex].password = newPass;
        
        localStorage.setItem('users', JSON.stringify(users));
        alert("會員資料已更新");
        displayMembers(); // 重新整理列表
    }
}

