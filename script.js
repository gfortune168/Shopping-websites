let cart = [];

// 加入購物車
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    cart.push(product);
    updateCart();
    // 提示使用者
    alert(`${product.name} 已加入購物車！`);
}

// 更新購物車顯示
function updateCart() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    cartCount.innerText = cart.length;
    
    cartItems.innerHTML = cart.map((item, index) => `
        <div style="display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:5px;">
            <span>${item.name}</span>
            <span>$${item.price}</span>
            <button onclick="removeFromCart(${index})" style="background:none; border:none; color:red; cursor:pointer;">刪除</button>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    cartTotal.innerText = `$${total}`;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// 側邊欄控制
const cartBtn = document.getElementById('cart-btn');
const closeCart = document.getElementById('close-cart');
const sidebar = document.getElementById('cart-sidebar');

cartBtn.onclick = () => sidebar.classList.add('active');
closeCart.onclick = () => sidebar.classList.remove('active');

// 預設帳號資料 (實際開發應從資料庫抓取)
const users = [
    { username: 'admin', password: 'admin123', role: 'ADMIN' },
    { username: 'user', password: 'user123', role: 'MEMBER' }
];

// 控制登入視窗
const loginBtn = document.querySelector('.fa-user'); // 點擊導覽列人頭
const loginModal = document.getElementById('login-modal');
const closeLogin = document.getElementById('close-login');

loginBtn.onclick = () => loginModal.style.display = "block";
closeLogin.onclick = () => loginModal.style.display = "none";


// 檢查權限並顯示對應介面 (修改版)
// script.js

// 修正：檢查權限並觸發顯示
// 原本第 112 行起的 checkRole 函式，請改為以下內容：
function checkRole(user) {
    const adminPanel = document.getElementById('admin-panel');
    const memberRecords = document.getElementById('member-records'); 
    const addProductForm = document.getElementById('add-product-form'); // 取得新增商品表單
    const userStatus = document.getElementById('user-status');
    const welcomeName = document.getElementById('welcome-name');
    const loginIcon = document.getElementById('login-icon');

    if (user) {
        if (userStatus) userStatus.style.display = "inline";
        if (loginIcon) loginIcon.style.display = "none";
        if (welcomeName) welcomeName.innerText = `您好, ${user.username || user.name}`;

        if (user.role === 'ADMIN') {
            if (adminPanel) adminPanel.style.display = "block";
            // --- 關鍵修正：預設隱藏子區塊，不要在登入時就顯示 ---
            if (memberRecords) memberRecords.style.display = "none"; 
            if (addProductForm) addProductForm.style.display = "none";
            
            displayProducts(true); 
        } else {
            if (adminPanel) adminPanel.style.display = "none";
            displayProducts(false); 
        }
    }
    if (user && user.role === 'ADMIN') {
        // 管理員登入後自動彈出客服視窗，方便接收問題
        setTimeout(() => {
            const chatWin = document.getElementById('chat-window');
            if (chatWin) {
                chatWin.style.display = "block";
                loadChatHistory();
            }
        }, 1000); // 延遲一秒彈出，體驗較好
    }
}



function adminEditUserPassword(email) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
        alert("找不到該會員");
        return;
    }

    const currentUser = users[userIndex];

    // 1. 修改姓名
    const newName = prompt(`正在修改會員 [${email}] 的資料\n請輸入新的姓名：`, currentUser.name);
    if (newName === null) return; // 按下取消則結束

    // 2. 修改密碼
    const newPassword = prompt(`請輸入 [${email}] 的新密碼：`, currentUser.password);
    if (newPassword === null) return;

    // 3. 執行更新
    if (newName.trim() === "" || newPassword.trim() === "") {
        alert("姓名與密碼不能為空！");
        return;
    }

    users[userIndex].name = newName.trim();
    users[userIndex].password = newPassword.trim();

    // 4. 存回儲存空間
    localStorage.setItem('users', JSON.stringify(users));
    
    alert(`會員 ${email} 的資料已更新成功！`);
    
    // 5. 重新整理畫面
    displayMembers();
}



// 這是配套的修改權限邏輯
function updateUserRole(email, newRole) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const index = users.findIndex(u => u.email === email);
    if (index !== -1) {
        users[index].role = newRole;
        localStorage.setItem('users', JSON.stringify(users));
        alert('權限已更新為: ' + newRole);
        displayMembers(); // 重新整理列表
    }
}
// ----------------



// 3. 登出函式 (統一處理)
function logout() {
    if (confirm("確定要登出嗎？")) {
        localStorage.removeItem('currentUser');
        alert("您已登出");
        window.location.reload(); 
    }
}



// 管理員功能範例
// 【核心修正：刪除商品】
function deleteProduct(id) {
    if (confirm("確定要下架此茶品嗎？")) {
        // 從全域變數 products 陣列中移除
        products = products.filter(p => p.id !== id);
        
        // 關鍵：將更新後的陣列存回 localStorage
        localStorage.setItem('tea_products', JSON.stringify(products));
        
        // 重新渲染畫面 (管理員模式)
        displayProducts(true);
        alert("商品已下架並儲存變更。");
    }
}

// 【核心修正：登出功能】
function logout() {
    // 1. 清除登入狀態
    localStorage.removeItem('currentUser');
    
    // 2. 選用：如果你希望登出後購物車也清空，取消下面這行註解
    // localStorage.removeItem('cart'); 

    // 3. 關鍵：重新導向並強制重整，讓 window.onload 重新判斷權限
    alert("您已安全登出");
    window.location.href = "index.html"; 
}

// 處理新增商品邏輯
// 修改 script.js 裡的 handleAddNewProduct 函式
function handleAddNewProduct() {
    const name = document.getElementById('new-p-name').value;
    const price = document.getElementById('new-p-price').value;
    const image = document.getElementById('new-p-image').value;
    const note = document.getElementById('new-p-note').value; // 抓取備註

    if (!name || !price) {
        alert("請輸入完整的品名與價格");
        return;
    }

    const newProduct = {
        id: Date.now(),
        name: name,
        price: parseInt(price),
        image: image || "https://via.placeholder.com/300",
        note: note // 將備註存入物件
    };

    products.unshift(newProduct);
    localStorage.setItem('tea_products', JSON.stringify(products)); // 持久化儲存
    
    displayProducts(true); 
    
    // 清空輸入框
    document.getElementById('new-p-name').value = '';
    document.getElementById('new-p-price').value = '';
    document.getElementById('new-p-image').value = '';
    document.getElementById('new-p-note').value = '';
    
    alert("商品已成功新增並顯示備註！");
}


// 修改之前的刪除功能，確保畫面與資料同步
function deleteProduct(id) {
    if (confirm("確定要下架此茶品嗎？")) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('tea_products', JSON.stringify(products)); // 同步儲存
        displayProducts(true); // 重新渲染管理員畫面
    }
}


// 1. 進入編輯模式：將資料填入表單
// 修改 script.js 中的 editProduct 函式
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    // 1. 使用統一的切換函式來顯示表單區塊，確保其他不相干區塊隱藏
    toggleAdminView('add-product-form');

    // 2. 填入資料 (保持您原本的邏輯)
    document.getElementById('edit-p-id').value = product.id;
    document.getElementById('new-p-name').value = product.name;
    document.getElementById('new-p-price').value = product.price;
    document.getElementById('new-p-image').value = product.image;
    document.getElementById('new-p-note').value = product.note || '';

    // 3. 修改標題與按鈕文字
    document.getElementById('form-title').innerHTML = `<i class="fas fa-edit"></i> 修改商品：${product.name}`;
    document.getElementById('save-btn').innerText = "更新商品資料";
    document.getElementById('cancel-btn').style.display = "inline-block";


    // 4. 捲動到表單位置
    document.getElementById('add-product-form').scrollIntoView({ behavior: 'smooth' });
}

    // 同步到本地儲存
    localStorage.setItem('tea_products', JSON.stringify(products));
    
    // 重新渲染畫面（管理員模式）
    displayProducts(true); 
    
    // 重置表單
    resetForm();


    // 儲存至 localStorage 並重置 UI
    localStorage.setItem('tea_products', JSON.stringify(products));
    
    // 重新渲染畫面 (傳入 true 是因為目前在管理員模式)
    displayProducts(true); 
    resetForm();


// 3. 重置表單
// 在 script.js 中找到並修改 resetForm 函式
function resetForm() {
    // A. 清空欄位
    document.getElementById('edit-p-id').value = '';
    document.getElementById('new-p-name').value = '';
    document.getElementById('new-p-price').value = '';
    document.getElementById('new-p-image').value = '';
    document.getElementById('new-p-note').value = '';
    
    // B. 恢復新增模式的文字
    document.getElementById('form-title').innerHTML = `<i class="fas fa-plus-circle"></i> 上架新茶品`;
    document.getElementById('save-btn').innerText = "確認上架";
    document.getElementById('cancel-btn').innerText = "返回";

    // C. 如果是點擊「返回」按鈕觸發的，隱藏表單
    // 檢查呼叫來源，或者統一讓 resetForm 具備收起功能
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.style.display = 'none';
    }
}

    


// script.js - 新增數量控制與修改購物車邏輯

// 1. 控制頁面上的數量增減
function changeQty(productId, amount) {
    const qtyInput = document.getElementById(`qty-${productId}`);
    let currentQty = parseInt(qtyInput.value);
    currentQty += amount;
    if (currentQty < 1) currentQty = 1; // 最少為 1
    qtyInput.value = currentQty;
}

// 2. 修改加入購物車邏輯 (支援數量)
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const qtyInput = document.getElementById(`qty-${productId}`);
    const quantity = parseInt(qtyInput.value);

    // 檢查購物車是否已有相同商品
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...product,
            quantity: quantity
        });
    }

    updateCart();
    alert(`${product.name} (共 ${quantity} 件) 已加入購物車！`);
    qtyInput.value = 1; // 重置數量回 1
}

// 3. 更新購物車顯示 (包含數量與小計)
function updateCart() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    // 計算總品項數量
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.innerText = totalItems;
    
    cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item-row">
            <div class="cart-item-info">
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-price">NT$ ${item.price} x ${item.quantity}</span>
            </div>
            <div class="cart-item-subtotal">
                <span>$${item.price * item.quantity}</span>
                <button onclick="removeFromCart(${index})" class="cart-remove-btn">刪除</button>
            </div>
        </div>
    `).join('');

    const totalMoney = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.innerText = `NT$ ${totalMoney}`;
}

// script.js - 新增分類篩選功能
// 修改後的 enterShop 函式
function enterShop() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        // 若未登入，顯示登入視窗
        document.getElementById('login-modal').style.display = "block";
        document.getElementById('login-msg').innerText = "請先登入會員以探索茶品";
        return;
    }

    // --- 關鍵修改：登入後隱藏首頁背景區域 ---
    const heroSection = document.getElementById('hero-bg');
    if (heroSection) {
        heroSection.style.display = 'none'; // 直接隱藏整個 Hero 區塊 (包含背景圖與進入提示)
    }

    // 根據角色顯示對應功能
    if (currentUser.role === 'ADMIN') {
        const adminPanel = document.getElementById('admin-panel');
        if(adminPanel) adminPanel.style.display = "block";
        showAllProducts(); // 顯示管理員商品列表
    } else {
        showAllProducts(); // 顯示一般用戶商品列表
    }
}

// 修改登入邏輯，確保登入後能「自動」顯示進入後的畫面
// 在 script.js 找到登入邏輯部分修改：
document.getElementById('login-submit').onclick = function() {
    const userIn = document.getElementById('username').value.trim();
    const passIn = document.getElementById('password').value;

    const defaultUsers = [
        { username: '超級管理員', email: 'admin', password: 'admin123', role: 'ADMIN', name: '超級管理員' },
    ];
    
    let registeredUsers = JSON.parse(localStorage.getItem('users')) || [];
    const allUsers = [...defaultUsers, ...registeredUsers];

    const user = allUsers.find(u => 
        (u.username === userIn || u.email === userIn) && u.password === passIn
    );

    if (user) {
        const loginTime = new Date().toLocaleString();
        
        // 建立 Session
        const sessionUser = {
            ...user,
            username: user.name || user.username,
            lastLogin: loginTime
        };
        localStorage.setItem('currentUser', JSON.stringify(sessionUser));

        // --- 關鍵修正：將時間存回註冊會員總表 ---
        const userIdx = registeredUsers.findIndex(u => u.email === user.email);
        if (userIdx !== -1) {
            registeredUsers[userIdx].lastLogin = loginTime; 
            localStorage.setItem('users', JSON.stringify(registeredUsers));
        }

        checkRole(sessionUser); 
        if (typeof displayProducts === 'function') displayProducts(sessionUser.role === 'ADMIN');
        
        document.getElementById('login-modal').style.display = "none";
        enterShop(); 
        
        alert(`歡迎回來, ${sessionUser.username}!`);
        loadChatHistory(); // 登入後立即載入對話
    } else {
        alert("帳號或密碼錯誤");
    }
};

// 新增：顯示訂單的函數

function viewUserOrders(email) {
    const modal = document.getElementById('order-modal');
    const content = document.getElementById('order-content');
    
    // 這裡從你的 localStorage 抓取實際訂單
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const userOrders = orders.filter(o => o.email === email);

    let html = `<h3>${email} 的訂單紀錄</h3>`;
    if(userOrders.length === 0) {
        html += "<p>尚無訂單資料</p>";
    } else {
        userOrders.forEach(o => {
            html += `
                <div style="border-bottom:1px solid #eee; padding:10px 0;">
                    <p>訂單號：${o.id} | 日期：${o.date}</p>
                    <p>總金額：$${o.total} | 狀態：${o.status}</p>
                </div>
            `;
        });
    }
    
    content.innerHTML = html;
    modal.style.display = "block";
}

function closeOrderModal() {
    document.getElementById('order-modal').style.display = "none";
}

// 2. 顯示商品與分類（點擊立即選購後）

function showAllProducts() {
    const catSection = document.getElementById('category-section');
    if (catSection) catSection.style.display = 'flex';

    const prodSection = document.getElementById('product-section');
    if (prodSection) prodSection.style.display = 'block';

    // 【關鍵修正】強制從 localStorage 更新最新的商品列表
    const savedProducts = localStorage.getItem('tea_products');
    products = savedProducts ? JSON.parse(savedProducts) : defaultProducts;
    
    displayProducts(checkIfAdmin());
    document.querySelector('.section-title').innerText = "精選推薦";
    catSection.scrollIntoView({ behavior: 'smooth' });
}

// 返回首頁 (回歸初始狀態，隱藏所有內容，但不登出)
function goHome() {
    // 1. 隱藏前台內容區塊
    const userSections = ['category-section', 'product-section', 'hero-text'];
    userSections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    // 2. 徹底隱藏管理員相關的所有區塊 (這是解決露餡問題的關鍵)
    const adminElements = [
        'admin-panel',        // 管理員主功能列
        'add-product-form',   // 新增/編輯商品表單
        'member-records',     // 會員紀錄 (對應您 checkRole 裡的 ID)
        'service-history',    // 客服對話紀錄
        'member-list'         // 會員清單
    ];

    adminElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    // 3. 顯示最原始的「點擊畫面進入探索」提示
    const enterHint = document.getElementById('enter-hint');
    if (enterHint) enterHint.style.display = 'block';

    // 4. 顯示 Hero 背景區塊 (若有)
    const heroBg = document.getElementById('hero-bg');
    if (heroBg) heroBg.style.display = 'flex';

    // 5. 畫面捲動回最上方
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
    
    
// 重新顯示首頁背景與提示
    const heroSection = document.getElementById('hero-bg');
    if (heroSection) {
        heroSection.style.display = 'flex'; // 恢復顯示
        document.getElementById('hero-text').style.display = 'none';
        document.getElementById('enter-hint').style.display = 'block';
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });






// 修正原有的分類篩選，確保它能運作
function filterByCategory(categoryName) {
    // 【關鍵修正】確保篩選前拿的是最新資料
    const savedProducts = localStorage.getItem('tea_products');
    const allProducts = savedProducts ? JSON.parse(savedProducts) : defaultProducts;
    
    products = allProducts.filter(p => p.category === categoryName);

    displayProducts(checkIfAdmin());
    document.querySelector('.section-title').innerText = categoryName;
    document.getElementById('product-section').scrollIntoView({ behavior: 'smooth' });
}

function checkIfAdmin() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser && currentUser.role === 'ADMIN';
}

// 輔助函式：判斷是否為管理員
function checkIfAdmin() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser && currentUser.role === 'ADMIN';
}

    
    // 4. 強制確保商品列表區塊（product-list）維持顯示
    const productList = document.getElementById('product-list');
    if (productList) {
        productList.style.display = 'block';
    }


        // --- 關鍵修改點 ---
        
        // A. 如果點擊的是「上架新茶品」按鈕，強制把表單變回「新增模式」
        if (viewId === 'add-product-form') {
            resetForm(); 
        }

        // B. 觸發對應的資料渲染
        if (viewId === 'member-list') displayMembers(); // 確保這裡的 ID 跟 HTML 一致
        if (viewId === 'service-history') renderServiceTable();


// 修改 checkRole，讓管理員登入時自動彈出視窗
function checkRole(user) {
    const adminPanel = document.getElementById('admin-panel');
    const userStatus = document.getElementById('user-status');
    const welcomeName = document.getElementById('welcome-name');

    if (user) {
        if (userStatus) userStatus.style.display = "inline";
        welcomeName.innerText = `您好, ${user.name}`;

        if (user.role === 'ADMIN') {
            adminPanel.style.display = "block";
            // 管理員登入自動開啟客服小視窗接收訊息
            setTimeout(() => {
                document.getElementById('chat-window').style.display = "block";
                loadChatHistory();
            }, 1000);
        } else {
            adminPanel.style.display = "none";
        }
    }
}


// --- 3. 管理員後台表格渲染 ---
// 渲染後台對話表格
// 渲染後台對話表格 (新增刪除按鈕版)
// 渲染後台對話表格 (新增回覆按鈕版)
function renderServiceTable() {
    const container = document.getElementById('service-list-container');
    const logs = JSON.parse(localStorage.getItem('service_logs')) || [];

    if (logs.length === 0) {
        container.innerHTML = "<p style='color: #666;'>目前尚無任何客服對話紀錄。</p>";
        return;
    }

    let html = `
        <table style="width:100%; border-collapse: collapse; min-width: 600px;">
            <thead style="background: #f4f4f4;">
                <tr>
                    <th style="padding:12px; border:1px solid #ddd; text-align:left;">時間</th>
                    <th style="padding:12px; border:1px solid #ddd; text-align:left;">會員姓名</th>
                    <th style="padding:12px; border:1px solid #ddd; text-align:left;">內容</th>
                    <th style="padding:12px; border:1px solid #ddd; text-align:center;">操作</th>
                </tr>
            </thead>
            <tbody>
                ${logs.map((log, index) => `
                    <tr>
                        <td style="padding:10px; border:1px solid #ddd; font-size:13px;">${log.time}</td>
                        <td style="padding:10px; border:1px solid #ddd;">${log.userName}</td>
                        <td style="padding:10px; border:1px solid #ddd;">${log.content}</td>
                        <td style="padding:10px; border:1px solid #ddd; text-align:center;">
                            <button onclick="prepareReply('${log.userName}', '${log.userEmail}')" style="background:#2D5A27; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-size:12px; margin-right:5px;">
                                <i class="fas fa-reply"></i> 回覆
                            </button>
                            <button onclick="deleteServiceLog(${index})" style="background:#ff4d4d; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-size:12px;">
                                <i class="fas fa-trash"></i> 刪除
                            </button>
                        </td>
                    </tr>
                `).reverse().join('')} 
            </tbody>
        </table>
    `;
    container.innerHTML = html;
}

// 全域變數紀錄目前正在回覆誰
let currentReplyingTo = null;

function prepareReply(userName, userEmail) {
    // 1. 開啟對話小視窗
    const chatWin = document.getElementById('chat-window');
    chatWin.style.display = "block";

    // 2. 設定回覆對象
    currentReplyingTo = { name: userName, email: userEmail };

    // 3. 在輸入框自動帶入稱呼
    const input = document.getElementById('chat-input');
    input.value = `@${userName} 您好：`;
    input.focus();

    // 4. 捲動到對話最下方並提示
    loadChatHistory();
    console.log(`準備回覆給: ${userName} (${userEmail})`);
}


// 刪除單筆客服紀錄
function deleteServiceLog(index) {
    let logs = JSON.parse(localStorage.getItem('service_logs')) || [];
    
    // 因為渲染時用了 .reverse()，所以索引需要重新計算
    // 如果你沒有用 .reverse()，直接用 logs.splice(index, 1) 即可
    const actualIndex = logs.length - 1 - index; 

    if (confirm("確定要刪除這筆對話紀錄嗎？此動作無法復原。")) {
        logs.splice(actualIndex, 1); // 刪除該筆資料
        localStorage.setItem('service_logs', JSON.stringify(logs)); // 存回 localStorage
        
        renderServiceTable(); // 重新整理表格
        loadChatHistory();    // 如果對話小視窗開著，也一併更新
        alert("紀錄已刪除");
    }
}

function clearAllServiceLogs() {
    if (confirm("警告！這將會永久刪除「所有」客服對話紀錄，確定嗎？")) {
        localStorage.removeItem('service_logs');
        renderServiceTable();
        loadChatHistory();
        alert("所有紀錄已清空");
    }
}

// 匯出 CSV (Excel 可開)
function downloadChatExcel() {
    const logs = JSON.parse(localStorage.getItem('service_logs')) || [];
    if (logs.length === 0) return alert("尚無資料可供下載");

    // CSV 標頭 + BOM 防止中文亂碼
    let csvContent = "\uFEFF時間,會員姓名,帳號/身份,對話內容\n";

    logs.forEach(log => {
        const row = [
            log.time,
            log.userName,
            log.role === 'ADMIN' ? '管理員' : log.userEmail,
            `"${log.content.replace(/"/g, '""')}"` // 處理雙引號
        ];
        csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `壯大茶品_客服紀錄_${new Date().toLocaleDateString()}.csv`;
    link.click();
}

    // 如果點擊的是會員紀錄，立即執行渲染
    if (viewId === 'member-records') {
        renderUnifiedMemberTable();
    }


// 2. 統一的會員列表渲染 (合併權限修改與資料修改)
function renderUnifiedMemberTable() {
    const container = document.getElementById('member-list-container');
    const usersData = JSON.parse(localStorage.getItem('users')) || [];

    if (usersData.length === 0) {
        container.innerHTML = "<p>目前尚無會員註冊紀錄。</p>";
        return;
    }

    let html = `
    <table style="width:100%; border-collapse: collapse; background:white;">
        <thead style="background:#2D5A27; color:white;">
            <tr>
                <th style="padding:10px; border:1px solid #ddd;">姓名/密碼</th>
                <th style="padding:10px; border:1px solid #ddd;">Email/最後登入</th>
                <th style="padding:10px; border:1px solid #ddd;">權限修改</th>
                <th style="padding:10px; border:1px solid #ddd;">管理操作</th>
            </tr>
        </thead>
        <tbody>`;

    usersData.forEach((u) => {
        const pwdId = `pwd-${u.email.replace(/[@.]/g, '-')}`;
        html += `
        <tr style="border-bottom:1px solid #eee; font-size: 0.9em;">
            <td style="padding:10px; border:1px solid #ddd;">
                <strong>${u.name}</strong><br>
                <span id="${pwdId}" style="color:#888;">******</span>
                <button onclick="revealPassword('${u.email}', '${pwdId}')" style="font-size:10px;">解鎖</button>
            </td>
            <td style="padding:10px; border:1px solid #ddd;">
                ${u.email}<br>
                <small style="color:blue;">登入: ${u.lastLogin || '無'}</small>
            </td>
            <td style="padding:10px; border:1px solid #ddd;">
                <select onchange="updateUserRole('${u.email}', this.value)">
                    <option value="USER" ${u.role !== 'ADMIN' ? 'selected' : ''}>一般會員</option>
                    <option value="ADMIN" ${u.role === 'ADMIN' ? 'selected' : ''}>管理員</option>
                </select>
            </td>
            <td style="padding:10px; border:1px solid #ddd;">
                <button onclick="adminEditUser('${u.email}')" style="background:#C5A059; color:white; border:none; padding:4px 8px; border-radius:3px;">修資料</button>
                <button onclick="adminDeleteUser('${u.email}')" style="background:#d9534f; color:white; border:none; padding:4px 8px; border-radius:3px;">刪除</button>
            </td>
        </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}


// 支援管理員密碼解鎖顯示
function revealPassword(email, spanId) {
    const adminPass = prompt("請輸入管理員確認密碼 (預設: admin123)");
    if (adminPass === "admin123") {
        const usersData = JSON.parse(localStorage.getItem('users')) || [];
        const user = usersData.find(u => u.email === email);
        if (user) {
            document.getElementById(spanId).innerText = user.password;
        }
    } else {
        alert("權限不足");
    }
}

// 點擊畫面進入探索 / 進入商店的功能
function enterShop() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        // 若未登入，顯示登入視窗
        document.getElementById('login-modal').style.display = "block";
        return;
    }

    // 1. 隱藏進入提示與 Hero 背景
    const heroSection = document.getElementById('hero-bg');
    const enterHint = document.getElementById('enter-hint');
    if (heroSection) heroSection.style.display = 'none';
    if (enterHint) enterHint.style.display = 'none';

    // 2. 顯示前台商品區域
    const catSection = document.getElementById('category-section');
    const prodSection = document.getElementById('product-section');
    if (catSection) catSection.style.display = 'flex';
    if (prodSection) prodSection.style.display = 'block';

    // 3. 【關鍵：重新顯示管理員權限】
    if (currentUser.role === 'ADMIN') {
        const adminPanel = document.getElementById('admin-panel');
        if (adminPanel) adminPanel.style.display = "block";
        displayProducts(true); // 渲染管理員模式商品
    } else {
        displayProducts(false); // 渲染一般模式商品
    }
}



// 新增功能：直接修改使用者權限
function updateUserRole(email, newRole) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const index = users.findIndex(u => u.email === email);

    if (index !== -1) {
        if (confirm(`確定要將 ${email} 的權限更改為 ${newRole === 'ADMIN' ? '管理員' : '一般使用者'} 嗎？`)) {
            users[index].role = newRole;
            localStorage.setItem('users', JSON.stringify(users));
            alert("權限已更新！");
            displayMembers(); // 重新整理列表
        } else {
            displayMembers(); // 取消時還原下拉選單顯示
        }
    }
}

// 必須配套加入這兩個功能函式到 script.js 最底部
function adminEditUser(email) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const index = users.findIndex(u => u.email === email);
    if (index === -1) return;

    const newName = prompt("請修改姓名：", users[index].name);
    const newPass = prompt("請修改密碼：", users[index].password);

    if (newName && newPass) {
        users[index].name = newName;
        users[index].password = newPass;
        localStorage.setItem('users', JSON.stringify(users));
        alert("資料已更新！");
        displayMembers();
    }
}

function adminDeleteUser(email) {
    if (confirm("確定要刪除會員 " + email + " 嗎？")) {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users = users.filter(u => u.email !== email);
        localStorage.setItem('users', JSON.stringify(users));
        alert("會員已刪除");
        displayMembers();
    }
}

// --- 客服功能邏輯 ---

// 1. 點擊客服圖示
function handleServiceClick() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        alert("請先登入會員方可使用客服功能");
        document.getElementById('login-modal').style.display = "block";
        return;
    }
    
    // 已登入，開啟對話框
    document.getElementById('chat-window').style.display = "block";
    loadChatHistory();
}

function closeChat() {
    document.getElementById('chat-window').style.display = "none";
}


// --- 管理員端邏輯 ---

// 4. 顯示所有對話紀錄 (供管理員查看)
function displayServiceLogs() {
    const container = document.getElementById('service-list-container');
    const logs = JSON.parse(localStorage.getItem('service_logs')) || [];

    if (logs.length === 0) {
        container.innerHTML = "<p>目前尚無對話紀錄</p>";
        return;
    }

    let html = `
    <table style="width:100%; border-collapse: collapse; background:white;">
        <thead style="background:#2D5A27; color:white;">
            <tr>
                <th style="padding:10px; border:1px solid #ddd;">使用者</th>
                <th style="padding:10px; border:1px solid #ddd;">帳號 (Email)</th>
                <th style="padding:10px; border:1px solid #ddd;">內容</th>
                <th style="padding:10px; border:1px solid #ddd;">時間</th>
            </tr>
        </thead>
        <tbody>
            ${logs.map(log => `
                <tr>
                    <td style="padding:10px; border:1px solid #ddd;">${log.userName}</td>
                    <td style="padding:10px; border:1px solid #ddd;">${log.userEmail}</td>
                    <td style="padding:10px; border:1px solid #ddd;">${log.content}</td>
                    <td style="padding:10px; border:1px solid #ddd;">${log.time}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>`;
    container.innerHTML = html;
}

// 5. 下載 Excel (CSV 格式)
function downloadChatExcel() {
    const logs = JSON.parse(localStorage.getItem('service_logs')) || [];
    if (logs.length === 0) {
        alert("尚無紀錄可供下載");
        return;
    }

    // CSV 表頭 (加入 BOM 避免中文亂碼)
    let csvContent = "\uFEFF使用者姓名,帳號,詢問內容,對話時間\n";
    
    logs.forEach(log => {
        // 處理內容中的逗號，避免破壞 CSV 結構
        const cleanContent = log.content.replace(/,/g, "，");
        csvContent += `${log.userName},${log.userEmail},${cleanContent},${log.time}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `客服對話紀錄_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 全域變數，用來暫存圖片的 Base64 字串
// 1. 在檔案最上方定義全域變數
let currentImageBase64 = ""; 

// 2. 處理圖片預覽與轉換
function previewImage(input) {
    const container = document.getElementById('image-preview-container');
    const preview = document.getElementById('image-preview');
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentImageBase64 = e.target.result; // 這裡將檔案存入變數
            preview.src = currentImageBase64;
            container.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// 3. 刪除預覽圖片
function removePreviewImage() {
    const fileInput = document.getElementById('new-p-image-file');
    const container = document.getElementById('image-preview-container');
    fileInput.value = ""; 
    currentImageBase64 = ""; 
    container.style.display = 'none';
}

// 4. 修改儲存函式 (解決沒有反應的問題)
// script.js 修正後的 handleSaveProduct 函式
function handleSaveProduct() {
    const editId = document.getElementById('edit-p-id').value;
    const name = document.getElementById('new-p-name').value;
    const price = parseInt(document.getElementById('new-p-price').value);
    const image = document.getElementById('new-p-image').value;
    const note = document.getElementById('new-p-note').value;
    const category = document.getElementById('new-p-category') ? document.getElementById('new-p-category').value : "未分類";

    if (!name || isNaN(price)) {
        alert("品名與價格為必填項目！");
        return;
    }

    if (editId) {
        // 【編輯模式修正點】
        const index = products.findIndex(p => p.id == editId);
        if (index !== -1) {
            // 直接更新全域 products 陣列中的內容
            products[index] = {
                ...products[index],
                name: name,
                price: price,
                image: image || "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=500",
                note: note,
                category: category
            };
            alert("商品更新成功！");
        }
    } else {
        // 【新增模式】
        const newProduct = {
            id: Date.now(),
            name: name,
            price: price,
            image: image || "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=500",
            note: note,
            category: category
        };
        products.unshift(newProduct);
        alert("新商品上架成功！");
    }

    // --- 關鍵修正：統一儲存並重繪介面 ---
    localStorage.setItem('tea_products', JSON.stringify(products)); // 寫入持久儲存
    displayProducts(true);  // 重新渲染管理員畫面
    resetForm();            // 清空並恢復新增表單狀態
}

// 5. 重置表單
function resetForm() {
    // 1. 清空欄位 (保持您原本的內容)
    document.getElementById('edit-p-id').value = '';
    document.getElementById('new-p-name').value = '';
    document.getElementById('new-p-price').value = '';
    document.getElementById('new-p-image').value = '';
    document.getElementById('new-p-note').value = '';
    
    // 2. 回復標題
    document.getElementById('form-title').innerHTML = `<i class="fas fa-plus-circle"></i> 上架新茶品`;
    document.getElementById('save-btn').innerText = "確認上架";

// 3. 【關鍵修改】隱藏所有區塊，回到「未點選按鈕」的乾淨畫面
    toggleAdminView(''); // 傳入空字串，會因為上面的迴圈而隱藏所有區塊
}


// 唯一發送訊息函式
// 發送訊息
// script.js 
function sendMessage() {
    const input = document.getElementById('chat-input');
    const content = input.value.trim();
    if (!content) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const logs = JSON.parse(localStorage.getItem('service_logs')) || [];

    const newMsg = {
        time: new Date().toLocaleString(),
        userName: currentUser.name || "訪客",
        userEmail: currentUser.email,
        role: currentUser.role, // 儲存角色 (ADMIN 或 USER)
        content: content
    };

    logs.push(newMsg);
    localStorage.setItem('service_logs', JSON.stringify(logs));
    
    input.value = "";
    loadChatHistory(); // 立即更新小視窗
    if (currentUser.role === 'ADMIN') renderServiceTable(); // 如果是管理員，同時更新後台表格
}

function loadChatHistory() {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    const logs = JSON.parse(localStorage.getItem('service_logs')) || [];

    // 過濾：管理員看全部，一般會員看自己發的 & 管理員發的所有訊息
    const displayLogs = logs.filter(log => {
        if (currentUser.role === 'ADMIN') return true;
        return log.userEmail === currentUser.email || log.role === 'ADMIN';
    });

    container.innerHTML = displayLogs.map(log => `
        <div style="margin-bottom: 12px; text-align: ${log.role === 'ADMIN' ? 'left' : 'right'};">
            <small style="color: #888;">${log.userName} [${log.time}]</small>
            <div style="background: ${log.role === 'ADMIN' ? '#e9ecef' : '#2D5A27'}; 
                        color: ${log.role === 'ADMIN' ? '#333' : 'white'}; 
                        padding: 8px 12px; border-radius: 10px; display: inline-block; max-width: 80%;">
                ${log.content}
            </div>
        </div>
    `).join('');
    container.scrollTop = container.scrollHeight;
}


function displayMembers() {
    const container = document.getElementById('member-list-container');
    if (!container) return;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    let html = `
        <table class="admin-table" style="width:100%; border-collapse: collapse; margin-top:10px;">
            <thead>
                <tr style="background:#f4f4f4; text-align:left;">
                    <th style="padding:10px; border:1px solid #ddd;">姓名</th>
                    <th style="padding:10px; border:1px solid #ddd;">Email</th>
                    <th style="padding:10px; border:1px solid #ddd;">最後登入時間</th>
                    <th style="padding:10px; border:1px solid #ddd;">操作</th>
                </tr>
            </thead>
            <tbody>
    `;

    if (users.length === 0) {
        html += '<tr><td colspan="4" style="text-align:center; padding:20px;">尚無會員紀錄</td></tr>';
    } else {
        users.forEach((user) => {
            html += `
                <tr>
                    <td style="padding:10px; border:1px solid #ddd;">${user.name || user.username}</td>
                    <td style="padding:10px; border:1px solid #ddd;">${user.email}</td>
                    <td style="padding:10px; border:1px solid #ddd; color:blue;">${user.lastLogin || '尚未登入'}</td>
                    <td style="padding:10px; border:1px solid #ddd;">
                        <button onclick="adminEditUser('${user.email}')" style="color:blue; margin-right:5px; cursor:pointer;">修改</button>
                        <button onclick="adminDeleteUser('${user.email}')" style="color:red; cursor:pointer;">刪除</button>
                    </td>
                </tr>
            `;
        });
    }

    html += `</tbody></table>`;
    container.innerHTML = html;
}
function renderServiceHistoryForAdmin() {
    const container = document.getElementById('service-history-content');
    if (!container) return;

    const logs = JSON.parse(localStorage.getItem('service_logs')) || [];
    
    if (logs.length === 0) {
        container.innerHTML = '<p>尚無客服對話紀錄</p>';
        return;
    }

    // 倒序顯示 (最新在上面)
    container.innerHTML = logs.slice().reverse().map(log => `
        <div style="border-bottom: 1px solid #eee; padding: 10px;">
            <span style="color:${log.role === 'ADMIN' ? '#d9534f' : '#5cb85c'}; font-weight:bold;">
                ${log.role === 'ADMIN' ? '[管理員回覆]' : log.userName}
            </span>
            <small style="color:#999; margin-left:10px;">${log.time}</small>
            <p style="margin: 5px 0 0 0;">${log.content}</p>
        </div>
    `).join('');
}

// 修正後台切換按鈕
function toggleAdminView(viewId) {
    const views = ['add-product-form', 'member-records', 'service-history'];
    views.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = (id === viewId) ? 'block' : 'none';
    });

    if (viewId === 'member-records') displayMembers();
    if (viewId === 'service-history') renderServiceHistoryForAdmin();
}


// 修正：新增註冊處理函式
function handleRegister() {
    // 1. 取得表單輸入值
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const birthday = document.getElementById('reg-birthday').value;
    const phone = document.getElementById('reg-mobile').value.trim(); // 使用手機欄位作為主要電話
    const address = document.getElementById('reg-address').value.trim();

    // 2. 基本驗證
    if (!name || !email || !password) {
        alert("請填寫姓名、Email 與密碼！");
        return;
    }

    // 3. 檢查帳號是否已存在
    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(u => u.email === email)) {
        alert("此 Email 已被註冊，請換一個或直接登入。");
        return;
    }

    // 4. 建立新會員物件 (包含初始化最後登入時間)
    const newUser = {
        name: name,
        email: email,
        password: password,
        birthday: birthday,
        phone: phone,
        address: address,
        role: "USER", // 預設權限為一般會員
        lastLogin: "新註冊(尚未登入)" // 初始化最後登入時間欄位
    };

    // 5. 存入儲存空間
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    alert("註冊成功！請使用新帳號登入。");
    
    // 6. 返回登入畫面
    showAuthSection('login-form-container');
    
    // 7. 清空註冊表單
    document.getElementById('reg-name').value = '';
    document.getElementById('reg-email').value = '';
    document.getElementById('reg-password').value = '';
}