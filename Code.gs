// =============================================================================
// BACKEND SYSTEM - TB NS JAYA (Code.gs)
// =============================================================================
// This is the single entry point for Google Apps Script Web App Backend.
// Google Spreadsheet is used as the relational database.
// All modules, validation, and handlers are bundled here.
// =============================================================================

// =============================================================================
// SECTION 1: CONFIGURATION
// =============================================================================
var CONFIG = {
  SPREADSHEET_ID: "", // Fill this if not run as Container-Bound Script
  JWT_SECRET: "tb_ns_jaya_super_secret_key_2026_prod",
  TOKEN_EXPIRY_MS: 24 * 60 * 60 * 1000, // 24 Hours
  DEFAULT_SALT: "tbnsjaya_salt_2026"
};

// =============================================================================
// SECTION 2: CONSTANT
// =============================================================================
var SHEETS = {
  USERS: "Users",
  ROLES: "Roles",
  CATEGORIES: "Categories",
  PRODUCTS: "Products",
  PRODUCT_IMAGES: "ProductImages",
  SUPPLIERS: "Suppliers",
  CUSTOMERS: "Customers",
  SALES: "Sales",
  SALES_DETAILS: "SalesDetails",
  PURCHASES: "Purchases",
  PURCHASE_DETAILS: "PurchaseDetails",
  STOCK_MOVEMENTS: "StockMovements",
  KASBON: "Kasbon",
  KASBON_PAYMENTS: "KasbonPayments",
  SUPPLIER_DEBT: "SupplierDebt",
  SUPPLIER_DEBT_PAYMENTS: "SupplierDebtPayments",
  BLOGS: "Blogs",
  BLOG_CATEGORIES: "BlogCategories",
  MEDIA: "Media",
  BANNERS: "Banners",
  PROMOTIONS: "Promotions",
  NOTIFICATIONS: "Notifications",
  ACTIVITY_LOGS: "ActivityLogs",
  WEBSITE_SETTINGS: "WebsiteSettings",
  ANALYTICS_SETTINGS: "AnalyticsSettings"
};

var HTTP_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500
};

var PERMISSION_MATRIX = {
  owner: ["*"],
  admin: [
    "dashboard.read",
    "products.*",
    "categories.*",
    "suppliers.*",
    "customers.*",
    "sales.read",
    "sales.create",
    "purchases.*",
    "stock.*",
    "kasbon.*",
    "debt.*",
    "blog.*",
    "media.*",
    "promotion.*",
    "settings.read",
    "reports.read",
    "analytics.read"
  ],
  kasir: [
    "dashboard.read",
    "products.read",
    "categories.read",
    "customers.*",
    "sales.create",
    "sales.read",
    "kasbon.read",
    "kasbon.create",
    "notifications.read"
  ],
  guest: [
    "products.read",
    "categories.read"
  ]
};

// =============================================================================
// SECTION 3: HELPER
// =============================================================================
function getDb() {
  if (CONFIG.SPREADSHEET_ID && CONFIG.SPREADSHEET_ID !== "") {
    return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet(sheetName) {
  var db = getDb();
  var sheet = db.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error("Sheet '" + sheetName + "' tidak ditemukan. Silakan jalankan initializeDatabase terlebih dahulu.");
  }
  return sheet;
}

function jsonResponse(success, code, message, data) {
  var responseObj = {
    success: success,
    code: code,
    message: message,
    data: data || null
  };
  return ContentService.createTextOutput(JSON.stringify(responseObj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheetData(sheetName) {
  var sheet = getSheet(sheetName);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var values = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  
  return values.map(function(row) {
    var obj = {};
    headers.forEach(function(header, idx) {
      obj[header] = row[idx];
    });
    return obj;
  });
}

function appendSheetRow(sheetName, dataObj) {
  var sheet = getSheet(sheetName);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var newRow = headers.map(function(header) {
    return dataObj[header] !== undefined ? dataObj[header] : "";
  });
  sheet.appendRow(newRow);
  return dataObj;
}

function updateSheetRow(sheetName, id, updateObj) {
  var sheet = getSheet(sheetName);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().map(function(r) { return r[0]; });
  
  var rowIndex = ids.indexOf(id);
  if (rowIndex === -1) return null;
  
  var actualRowIndex = rowIndex + 2;
  headers.forEach(function(header, idx) {
    if (updateObj[header] !== undefined && header !== "id") {
      sheet.getRange(actualRowIndex, idx + 1).setValue(updateObj[header]);
    }
  });
  
  // Return updated data
  var rowValues = sheet.getRange(actualRowIndex, 1, 1, headers.length).getValues()[0];
  var updated = {};
  headers.forEach(function(header, idx) {
    updated[header] = rowValues[idx];
  });
  return updated;
}

function deleteSheetRow(sheetName, id) {
  var sheet = getSheet(sheetName);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;
  
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().map(function(r) { return r[0]; });
  var rowIndex = ids.indexOf(id);
  if (rowIndex === -1) return false;
  
  sheet.deleteRow(rowIndex + 2);
  return true;
}

// Custom JWT Implementation for Google Apps Script
function generateJwt(payload) {
  var header = { alg: "HS256", typ: "JWT" };
  var exp = new Date().getTime() + CONFIG.TOKEN_EXPIRY_MS;
  payload.exp = exp;
  
  var headerBase64 = base64Encode(JSON.stringify(header));
  var payloadBase64 = base64Encode(JSON.stringify(payload));
  var signature = computeHmac(headerBase64 + "." + payloadBase64, CONFIG.JWT_SECRET);
  
  return headerBase64 + "." + payloadBase64 + "." + signature;
}

function verifyJwt(token) {
  if (!token) return null;
  var parts = token.split(".");
  if (parts.length !== 3) return null;
  
  var headerBase64 = parts[0];
  var payloadBase64 = parts[1];
  var signature = parts[2];
  
  var expectedSignature = computeHmac(headerBase64 + "." + payloadBase64, CONFIG.JWT_SECRET);
  if (signature !== expectedSignature) return null;
  
  try {
    var payload = JSON.parse(base64Decode(payloadBase64));
    var now = new Date().getTime();
    if (payload.exp && now > payload.exp) return null; // Expired
    return payload;
  } catch (e) {
    return null;
  }
}

function base64Encode(str) {
  return Utilities.base64EncodeWebSafe(Utilities.newBlob(str).getBytes()).replace(/=+$/, "");
}

function base64Decode(str) {
  // Pad if necessary
  var padded = str;
  while (padded.length % 4 !== 0) padded += "=";
  return Utilities.newBlob(Utilities.base64DecodeWebSafe(padded)).getDataAsString();
}

function computeHmac(message, secret) {
  var key = Utilities.newBlob(secret).getBytes();
  var msg = Utilities.newBlob(message).getBytes();
  var signature = Utilities.computeHmacSha256Signature(msg, key);
  return Utilities.base64EncodeWebSafe(signature).replace(/=+$/, "");
}

// =============================================================================
// SECTION 4: AUTHENTICATION
// =============================================================================
function hashPassword(password) {
  var sha256 = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password + CONFIG.DEFAULT_SALT, Utilities.Charset.UTF_8);
  var hash = "";
  for (var i = 0; i < sha256.length; i++) {
    var byteVal = sha256[i];
    if (byteVal < 0) byteVal += 256;
    var byteString = byteVal.toString(16);
    if (byteString.length == 1) byteString = "0" + byteString;
    hash += byteString;
  }
  return hash;
}

function checkUserPermission(role, requiredPermission) {
  if (role === "owner") return true;
  var permissions = PERMISSION_MATRIX[role] || [];
  if (permissions.indexOf("*") !== -1) return true;
  
  // Direct match
  if (permissions.indexOf(requiredPermission) !== -1) return true;
  
  // Wildcard match e.g. "products.*" matches "products.read"
  var requiredPart = requiredPermission.split(".")[0];
  if (permissions.indexOf(requiredPart + ".*") !== -1) return true;
  
  return false;
}

function handleLogin(payload) {
  if (!payload.username || !payload.password) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Username dan password wajib diisi" };
  }
  
  var users = getSheetData(SHEETS.USERS);
  var user = users.find(function(u) {
    return u.username.toLowerCase() === payload.username.toLowerCase() && u.status === "active";
  });
  
  if (!user) {
    return { success: false, code: HTTP_CODES.UNAUTHORIZED, message: "Username atau password salah" };
  }
  
  var hashed = hashPassword(payload.password);
  if (user.passwordHash !== hashed) {
    return { success: false, code: HTTP_CODES.UNAUTHORIZED, message: "Username atau password salah" };
  }
  
  // Fetch Role name
  var roles = getSheetData(SHEETS.ROLES);
  var role = roles.find(function(r) { return r.id === user.roleId; });
  var roleName = role ? role.name : "kasir";
  
  var token = generateJwt({
    userId: user.id,
    username: user.username,
    role: roleName
  });
  
  // Log Activity
  logActivity(user.id, "LOGIN", "User " + user.username + " berhasil login");
  
  return {
    success: true,
    code: HTTP_CODES.OK,
    message: "Login berhasil",
    data: {
      token: token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        roleId: user.roleId,
        roleName: roleName,
        status: user.status,
        createdAt: user.createdAt
      }
    }
  };
}

// =============================================================================
// SECTION 5: VALIDATION
// =============================================================================
function validatePayload(payload, rules) {
  var errors = [];
  for (var field in rules) {
    var rule = rules[field];
    var val = payload[field];
    
    // Required check
    if (rule.required && (val === undefined || val === null || val === "")) {
      errors.push("Field '" + field + "' wajib diisi.");
      continue;
    }
    
    if (val !== undefined && val !== null && val !== "") {
      // UUID check
      if (rule.type === "uuid" && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)) {
        errors.push("Field '" + field + "' harus berupa format UUID valid.");
      }
      // Date check
      if (rule.type === "date" && isNaN(Date.parse(val))) {
        errors.push("Field '" + field + "' harus berupa tanggal valid.");
      }
      // Number check
      if (rule.type === "number" && isNaN(Number(val))) {
        errors.push("Field '" + field + "' harus berupa angka.");
      }
      // Phone check
      if (rule.type === "phone" && !/^\+?[0-9]{8,15}$/.test(val.toString())) {
        errors.push("Field '" + field + "' harus berupa format nomor telepon valid.");
      }
    }
  }
  return errors;
}

function checkDuplicate(sheetName, column, value, excludeId) {
  var data = getSheetData(sheetName);
  return data.some(function(row) {
    if (excludeId && row.id === excludeId) return false;
    return row[column] && row[column].toString().toLowerCase() === value.toString().toLowerCase();
  });
}

// =============================================================================
// SECTION 6: ROUTER
// =============================================================================
function doPost(e) {
  // CORS Headers support
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    var token = body.token || "";
    var payload = body.payload || {};
    
    if (!action) {
      return jsonResponse(false, HTTP_CODES.BAD_REQUEST, "Parameter action wajib disertakan");
    }
    
    // Auth bypass for login & initdb
    if (action === "login") {
      var loginRes = handleLogin(payload);
      return jsonResponse(loginRes.success, loginRes.code, loginRes.message, loginRes.data);
    }
    if (action === "initDb") {
      var initRes = initializeDatabase();
      return jsonResponse(initRes.success, initRes.code, initRes.message, initRes.data);
    }
    
    // Verify token
    var userPayload = verifyJwt(token);
    if (!userPayload) {
      var publicActions = [
        "getProducts",
        "getCategories",
        "getBlogs",
        "getBlogCategories",
        "getBanners",
        "getPromotions",
        "getWebsiteSettings",
        "getAnalyticsSettings"
      ];
      if (publicActions.indexOf(action) !== -1) {
        userPayload = { role: "guest", userId: "guest" };
      } else {
        return jsonResponse(false, HTTP_CODES.UNAUTHORIZED, "Token tidak valid atau kedaluwarsa");
      }
    }
    
    // Route request
    var handlerResponse = routeAction(action, payload, userPayload);
    return jsonResponse(handlerResponse.success, handlerResponse.code, handlerResponse.message, handlerResponse.data);
    
  } catch (err) {
    return jsonResponse(false, HTTP_CODES.INTERNAL_ERROR, "Server Error: " + err.message, err.stack);
  }
}

function doGet(e) {
  // Enable simple read access via HTTP GET with query params
  try {
    var resource = e.parameter.resource;
    var token = e.parameter.token || "";
    
    if (!resource) {
      return jsonResponse(false, HTTP_CODES.BAD_REQUEST, "Parameter resource wajib disertakan");
    }
    
    var userPayload = verifyJwt(token);
    if (!userPayload) {
      return jsonResponse(false, HTTP_CODES.UNAUTHORIZED, "Token tidak valid atau kedaluwarsa");
    }
    
    var mappedAction = "get" + resource.charAt(0).toUpperCase() + resource.slice(1);
    var params = {};
    for (var k in e.parameter) {
      if (k !== "resource" && k !== "token") {
        params[k] = e.parameter[k];
      }
    }
    
    var handlerResponse = routeAction(mappedAction, params, userPayload);
    return jsonResponse(handlerResponse.success, handlerResponse.code, handlerResponse.message, handlerResponse.data);
    
  } catch (err) {
    return jsonResponse(false, HTTP_CODES.INTERNAL_ERROR, "Server Error: " + err.message);
  }
}

function routeAction(action, payload, user) {
  switch (action) {
    // DASHBOARD
    case "getDashboardStats":
      if (!checkUserPermission(user.role, "dashboard.read")) return forbidden();
      return handleGetDashboardStats();
      
    // PRODUCTS
    case "getProducts":
      if (!checkUserPermission(user.role, "products.read")) return forbidden();
      return handleGetProducts(payload);
    case "createProduct":
      if (!checkUserPermission(user.role, "products.create")) return forbidden();
      return handleCreateProduct(payload, user.userId);
    case "updateProduct":
      if (!checkUserPermission(user.role, "products.update")) return forbidden();
      return handleUpdateProduct(payload, user.userId);
    case "deleteProduct":
      if (!checkUserPermission(user.role, "products.delete")) return forbidden();
      return handleDeleteProduct(payload, user.userId);
      
    // CATEGORIES
    case "getCategories":
      if (!checkUserPermission(user.role, "categories.read")) return forbidden();
      return handleGetCategories(payload);
    case "createCategory":
      if (!checkUserPermission(user.role, "categories.create")) return forbidden();
      return handleCreateCategory(payload, user.userId);
    case "updateCategory":
      if (!checkUserPermission(user.role, "categories.update")) return forbidden();
      return handleUpdateCategory(payload, user.userId);
    case "deleteCategory":
      if (!checkUserPermission(user.role, "categories.delete")) return forbidden();
      return handleDeleteCategory(payload, user.userId);
      
    // SUPPLIERS
    case "getSuppliers":
      if (!checkUserPermission(user.role, "suppliers.read")) return forbidden();
      return handleGetSuppliers(payload);
    case "createSupplier":
      if (!checkUserPermission(user.role, "suppliers.create")) return forbidden();
      return handleCreateSupplier(payload, user.userId);
    case "updateSupplier":
      if (!checkUserPermission(user.role, "suppliers.update")) return forbidden();
      return handleUpdateSupplier(payload, user.userId);
    case "deleteSupplier":
      if (!checkUserPermission(user.role, "suppliers.delete")) return forbidden();
      return handleDeleteSupplier(payload, user.userId);
      
    // CUSTOMERS
    case "getCustomers":
      if (!checkUserPermission(user.role, "customers.read")) return forbidden();
      return handleGetCustomers(payload);
    case "createCustomer":
      if (!checkUserPermission(user.role, "customers.create")) return forbidden();
      return handleCreateCustomer(payload, user.userId);
    case "updateCustomer":
      if (!checkUserPermission(user.role, "customers.update")) return forbidden();
      return handleUpdateCustomer(payload, user.userId);
    case "deleteCustomer":
      if (!checkUserPermission(user.role, "customers.delete")) return forbidden();
      return handleDeleteCustomer(payload, user.userId);
      
    // SALES
    case "getSales":
      if (!checkUserPermission(user.role, "sales.read")) return forbidden();
      return handleGetSales(payload);
    case "createSale":
      if (!checkUserPermission(user.role, "sales.create")) return forbidden();
      return handleCreateSale(payload, user.userId);
    case "voidSale":
      if (!checkUserPermission(user.role, "sales.void")) return forbidden();
      return handleVoidSale(payload, user.userId);
      
    // PURCHASES
    case "getPurchases":
      if (!checkUserPermission(user.role, "purchases.read")) return forbidden();
      return handleGetPurchases(payload);
    case "createPurchase":
      if (!checkUserPermission(user.role, "purchases.create")) return forbidden();
      return handleCreatePurchase(payload, user.userId);
      
    // STOCK MOVEMENTS
    case "getStockMovements":
      if (!checkUserPermission(user.role, "stock.read")) return forbidden();
      return handleGetStockMovements(payload);
    case "createStockMovement":
      if (!checkUserPermission(user.role, "stock.create")) return forbidden();
      return handleCreateStockMovement(payload, user.userId);
      
    // KASBON
    case "getKasbon":
      if (!checkUserPermission(user.role, "kasbon.read")) return forbidden();
      return handleGetKasbon(payload);
    case "payKasbon":
      if (!checkUserPermission(user.role, "kasbon.create")) return forbidden();
      return handlePayKasbon(payload, user.userId);
      
    // SUPPLIER DEBT
    case "getSupplierDebt":
      if (!checkUserPermission(user.role, "debt.read")) return forbidden();
      return handleGetSupplierDebt(payload);
    case "paySupplierDebt":
      if (!checkUserPermission(user.role, "debt.create")) return forbidden();
      return handlePaySupplierDebt(payload, user.userId);
      
    // BLOG
    case "getBlogs":
      return handleGetBlogs(payload);
    case "createBlog":
      if (!checkUserPermission(user.role, "blog.create")) return forbidden();
      return handleCreateBlog(payload, user.userId);
    case "updateBlog":
      if (!checkUserPermission(user.role, "blog.update")) return forbidden();
      return handleUpdateBlog(payload, user.userId);
    case "deleteBlog":
      if (!checkUserPermission(user.role, "blog.delete")) return forbidden();
      return handleDeleteBlog(payload, user.userId);
      
    // BLOG CATEGORIES
    case "getBlogCategories":
      return handleGetBlogCategories(payload);
    case "createBlogCategory":
      if (!checkUserPermission(user.role, "blog.create")) return forbidden();
      return handleCreateBlogCategory(payload, user.userId);
    case "updateBlogCategory":
      if (!checkUserPermission(user.role, "blog.update")) return forbidden();
      return handleUpdateBlogCategory(payload, user.userId);
    case "deleteBlogCategory":
      if (!checkUserPermission(user.role, "blog.delete")) return forbidden();
      return handleDeleteBlogCategory(payload, user.userId);
      
    // MEDIA
    case "getMedia":
      if (!checkUserPermission(user.role, "media.read")) return forbidden();
      return handleGetMedia(payload);
    case "createMedia":
      if (!checkUserPermission(user.role, "media.create")) return forbidden();
      return handleCreateMedia(payload, user.userId);
    case "deleteMedia":
      if (!checkUserPermission(user.role, "media.delete")) return forbidden();
      return handleDeleteMedia(payload, user.userId);
      
    // BANNERS
    case "getBanners":
      return handleGetBanners(payload);
    case "createBanner":
      if (!checkUserPermission(user.role, "settings.write")) return forbidden();
      return handleCreateBanner(payload, user.userId);
    case "updateBanner":
      if (!checkUserPermission(user.role, "settings.write")) return forbidden();
      return handleUpdateBanner(payload, user.userId);
    case "deleteBanner":
      if (!checkUserPermission(user.role, "settings.write")) return forbidden();
      return handleDeleteBanner(payload, user.userId);
      
    // PROMOTION
    case "getPromotions":
      return handleGetPromotions(payload);
    case "createPromotion":
      if (!checkUserPermission(user.role, "promotion.create")) return forbidden();
      return handleCreatePromotion(payload, user.userId);
    case "updatePromotion":
      if (!checkUserPermission(user.role, "promotion.update")) return forbidden();
      return handleUpdatePromotion(payload, user.userId);
    case "deletePromotion":
      if (!checkUserPermission(user.role, "promotion.delete")) return forbidden();
      return handleDeletePromotion(payload, user.userId);
      
    // NOTIFICATION
    case "getNotifications":
      if (!checkUserPermission(user.role, "notifications.read")) return forbidden();
      return handleGetNotifications(payload, user.userId);
    case "readNotification":
      if (!checkUserPermission(user.role, "notifications.read")) return forbidden();
      return handleReadNotification(payload, user.userId);
      
    // SETTINGS
    case "getWebsiteSettings":
      return handleGetWebsiteSettings();
    case "updateWebsiteSettings":
      if (!checkUserPermission(user.role, "settings.write")) return forbidden();
      return handleUpdateWebsiteSettings(payload, user.userId);
    case "getAnalyticsSettings":
      return handleGetAnalyticsSettings();
    case "updateAnalyticsSettings":
      if (!checkUserPermission(user.role, "settings.write")) return forbidden();
      return handleUpdateAnalyticsSettings(payload, user.userId);
      
    // REPORTS
    case "getSalesReport":
      if (!checkUserPermission(user.role, "reports.read")) return forbidden();
      return handleGetSalesReport(payload);
      
    default:
      return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Action '" + action + "' tidak dikenali." };
  }
}

function forbidden() {
  return { success: false, code: HTTP_CODES.FORBIDDEN, message: "Anda tidak memiliki izin untuk melakukan tindakan ini." };
}

// =============================================================================
// SECTION 7: DASHBOARD
// =============================================================================
function handleGetDashboardStats() {
  var sales = getSheetData(SHEETS.SALES);
  var purchases = getSheetData(SHEETS.PURCHASES);
  var products = getSheetData(SHEETS.PRODUCTS);
  var stockMovements = getSheetData(SHEETS.STOCK_MOVEMENTS);
  var kasbons = getSheetData(SHEETS.KASBON);
  var debts = getSheetData(SHEETS.SUPPLIER_DEBT);
  
  var today = new Date().toISOString().substring(0, 10);
  
  // Calculations
  var todaySales = 0;
  var totalSales = 0;
  sales.forEach(function(s) {
    if (s.status !== "void") {
      totalSales += Number(s.total);
      if (s.date && s.date.toString().substring(0, 10) === today) {
        todaySales += Number(s.total);
      }
    }
  });
  
  var totalPurchases = 0;
  purchases.forEach(function(p) {
    totalPurchases += Number(p.total);
  });
  
  // Calculate Stocks
  var stockMap = {};
  stockMovements.forEach(function(sm) {
    var pid = sm.productId;
    var qty = Number(sm.qty);
    if (!stockMap[pid]) stockMap[pid] = 0;
    if (sm.type === "IN") stockMap[pid] += qty;
    else if (sm.type === "OUT") stockMap[pid] -= qty;
    else if (sm.type === "ADJ") stockMap[pid] = qty;
  });
  
  var outOfStockCount = 0;
  var lowStockCount = 0;
  products.forEach(function(p) {
    var stock = stockMap[p.id] || 0;
    if (stock <= 0) outOfStockCount++;
    else if (stock < 10) lowStockCount++; // Low stock threshold: 10
  });
  
  // Kasbon & Debt Summary
  var totalOutstandingKasbon = 0;
  kasbons.forEach(function(k) {
    if (k.status !== "paid") totalOutstandingKasbon += Number(k.amount);
  });
  
  var totalOutstandingDebt = 0;
  debts.forEach(function(d) {
    if (d.status !== "paid") totalOutstandingDebt += Number(d.amount);
  });
  
  return {
    success: true,
    code: HTTP_CODES.OK,
    message: "Dashboard stats berhasil dimuat",
    data: {
      kpi: {
        todaySales: todaySales,
        totalSales: totalSales,
        totalPurchases: totalPurchases,
        outOfStockCount: outOfStockCount,
        lowStockCount: lowStockCount,
        outstandingKasbon: totalOutstandingKasbon,
        outstandingDebt: totalOutstandingDebt
      }
    }
  };
}

// =============================================================================
// SECTION 8: PRODUCT
// =============================================================================
function handleGetProducts(params) {
  var list = getSheetData(SHEETS.PRODUCTS);
  var images = getSheetData(SHEETS.PRODUCT_IMAGES);
  var categories = getSheetData(SHEETS.CATEGORIES);
  
  // Map dependencies
  var stockMovements = getSheetData(SHEETS.STOCK_MOVEMENTS);
  var stockMap = {};
  stockMovements.forEach(function(sm) {
    var pid = sm.productId;
    var qty = Number(sm.qty);
    if (!stockMap[pid]) stockMap[pid] = 0;
    if (sm.type === "IN") stockMap[pid] += qty;
    else if (sm.type === "OUT") stockMap[pid] -= qty;
    else if (sm.type === "ADJ") stockMap[pid] = qty;
  });
  
  var result = list.map(function(p) {
    var cat = categories.find(function(c) { return c.id === p.categoryId; });
    var pImgs = images.filter(function(img) { return img.productId === p.id; });
    return {
      id: p.id,
      categoryId: p.categoryId,
      categoryName: cat ? cat.name : "Umum",
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      barcode: p.barcode,
      buyPrice: Number(p.buyPrice),
      sellPrice: Number(p.sellPrice),
      unit: p.unit,
      isActive: p.isActive === true || p.isActive === "TRUE" || p.isActive === 1,
      currentStock: stockMap[p.id] || 0,
      images: pImgs
    };
  });
  
  return paginateAndSort(result, params);
}

function handleCreateProduct(payload, userId) {
  var valErrors = validatePayload(payload, {
    categoryId: { required: true, type: "uuid" },
    name: { required: true },
    slug: { required: true },
    sku: { required: true },
    buyPrice: { required: true, type: "number" },
    sellPrice: { required: true, type: "number" },
    unit: { required: true }
  });
  
  if (valErrors.length > 0) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: valErrors.join(" ") };
  }
  
  if (checkDuplicate(SHEETS.PRODUCTS, "sku", payload.sku)) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "SKU sudah digunakan" };
  }
  
  if (checkDuplicate(SHEETS.PRODUCTS, "slug", payload.slug)) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Slug sudah digunakan" };
  }
  
  payload.id = generateUuid();
  payload.isActive = payload.isActive !== undefined ? payload.isActive : true;
  payload.createdAt = new Date().toISOString();
  
  appendSheetRow(SHEETS.PRODUCTS, payload);
  
  // Handle Primary Image if provided
  if (payload.imageUrl) {
    appendSheetRow(SHEETS.PRODUCT_IMAGES, {
      id: generateUuid(),
      productId: payload.id,
      imageUrl: payload.imageUrl,
      isPrimary: true
    });
  }
  
  // Log Activity
  logActivity(userId, "CREATE_PRODUCT", "Product " + payload.name + " (" + payload.sku + ") berhasil ditambahkan");
  
  return { success: true, code: HTTP_CODES.CREATED, message: "Product berhasil ditambahkan", data: payload };
}

function handleUpdateProduct(payload, userId) {
  if (!payload.id) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Product ID wajib disertakan" };
  }
  
  if (payload.sku && checkDuplicate(SHEETS.PRODUCTS, "sku", payload.sku, payload.id)) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "SKU sudah digunakan" };
  }
  
  var updated = updateSheetRow(SHEETS.PRODUCTS, payload.id, payload);
  if (!updated) {
    return { success: false, code: HTTP_CODES.NOT_FOUND, message: "Product tidak ditemukan" };
  }
  
  logActivity(userId, "UPDATE_PRODUCT", "Product ID " + payload.id + " berhasil diupdate");
  return { success: true, code: HTTP_CODES.OK, message: "Product berhasil diupdate", data: updated };
}

function handleDeleteProduct(payload, userId) {
  if (!payload.id) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Product ID wajib disertakan" };
  }
  
  var success = deleteSheetRow(SHEETS.PRODUCTS, payload.id);
  if (!success) {
    return { success: false, code: HTTP_CODES.NOT_FOUND, message: "Product tidak ditemukan" };
  }
  
  // Remove related stock movements and images
  var movements = getSheetData(SHEETS.STOCK_MOVEMENTS);
  movements.forEach(function(m) {
    if (m.productId === payload.id) deleteSheetRow(SHEETS.STOCK_MOVEMENTS, m.id);
  });
  
  logActivity(userId, "DELETE_PRODUCT", "Product ID " + payload.id + " dihapus");
  return { success: true, code: HTTP_CODES.OK, message: "Product berhasil dihapus" };
}

// =============================================================================
// SECTION 9: CATEGORY
// =============================================================================
function handleGetCategories(params) {
  var list = getSheetData(SHEETS.CATEGORIES);
  return paginateAndSort(list, params);
}

function handleCreateCategory(payload, userId) {
  if (!payload.name || !payload.slug) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Nama dan slug kategori wajib diisi" };
  }
  
  if (checkDuplicate(SHEETS.CATEGORIES, "slug", payload.slug)) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Slug kategori sudah digunakan" };
  }
  
  payload.id = generateUuid();
  appendSheetRow(SHEETS.CATEGORIES, payload);
  
  logActivity(userId, "CREATE_CATEGORY", "Kategori " + payload.name + " dibuat");
  return { success: true, code: HTTP_CODES.CREATED, message: "Kategori berhasil dibuat", data: payload };
}

function handleUpdateCategory(payload, userId) {
  if (!payload.id) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Category ID wajib disertakan" };
  }
  
  var updated = updateSheetRow(SHEETS.CATEGORIES, payload.id, payload);
  if (!updated) {
    return { success: false, code: HTTP_CODES.NOT_FOUND, message: "Kategori tidak ditemukan" };
  }
  
  logActivity(userId, "UPDATE_CATEGORY", "Kategori ID " + payload.id + " diupdate");
  return { success: true, code: HTTP_CODES.OK, message: "Kategori berhasil diupdate", data: updated };
}

function handleDeleteCategory(payload, userId) {
  if (!payload.id) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Category ID wajib disertakan" };
  }
  
  var success = deleteSheetRow(SHEETS.CATEGORIES, payload.id);
  if (!success) {
    return { success: false, code: HTTP_CODES.NOT_FOUND, message: "Kategori tidak ditemukan" };
  }
  
  logActivity(userId, "DELETE_CATEGORY", "Kategori ID " + payload.id + " dihapus");
  return { success: true, code: HTTP_CODES.OK, message: "Kategori berhasil dihapus" };
}

// =============================================================================
// SECTION 10: SUPPLIER
// =============================================================================
function handleGetSuppliers(params) {
  var list = getSheetData(SHEETS.SUPPLIERS);
  return paginateAndSort(list, params);
}

function handleCreateSupplier(payload, userId) {
  if (!payload.name || !payload.contact) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Nama dan kontak supplier wajib diisi" };
  }
  
  payload.id = generateUuid();
  appendSheetRow(SHEETS.SUPPLIERS, payload);
  
  logActivity(userId, "CREATE_SUPPLIER", "Supplier " + payload.name + " ditambahkan");
  return { success: true, code: HTTP_CODES.CREATED, message: "Supplier berhasil ditambahkan", data: payload };
}

function handleUpdateSupplier(payload, userId) {
  if (!payload.id) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Supplier ID wajib disertakan" };
  }
  
  var updated = updateSheetRow(SHEETS.SUPPLIERS, payload.id, payload);
  if (!updated) {
    return { success: false, code: HTTP_CODES.NOT_FOUND, message: "Supplier tidak ditemukan" };
  }
  
  logActivity(userId, "UPDATE_SUPPLIER", "Supplier ID " + payload.id + " diupdate");
  return { success: true, code: HTTP_CODES.OK, message: "Supplier berhasil diupdate", data: updated };
}

function handleDeleteSupplier(payload, userId) {
  if (!payload.id) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Supplier ID wajib disertakan" };
  }
  
  var success = deleteSheetRow(SHEETS.SUPPLIERS, payload.id);
  if (!success) {
    return { success: false, code: HTTP_CODES.NOT_FOUND, message: "Supplier tidak ditemukan" };
  }
  
  logActivity(userId, "DELETE_SUPPLIER", "Supplier ID " + payload.id + " dihapus");
  return { success: true, code: HTTP_CODES.OK, message: "Supplier berhasil dihapus" };
}

// =============================================================================
// SECTION 11: CUSTOMER
// =============================================================================
function handleGetCustomers(params) {
  var list = getSheetData(SHEETS.CUSTOMERS);
  return paginateAndSort(list, params);
}

function handleCreateCustomer(payload, userId) {
  if (!payload.name || !payload.phone) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Nama dan nomor telepon customer wajib diisi" };
  }
  
  payload.id = generateUuid();
  payload.type = payload.type || "umum";
  appendSheetRow(SHEETS.CUSTOMERS, payload);
  
  logActivity(userId, "CREATE_CUSTOMER", "Customer " + payload.name + " ditambahkan");
  return { success: true, code: HTTP_CODES.CREATED, message: "Customer berhasil ditambahkan", data: payload };
}

function handleUpdateCustomer(payload, userId) {
  if (!payload.id) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Customer ID wajib disertakan" };
  }
  
  var updated = updateSheetRow(SHEETS.CUSTOMERS, payload.id, payload);
  if (!updated) {
    return { success: false, code: HTTP_CODES.NOT_FOUND, message: "Customer tidak ditemukan" };
  }
  
  logActivity(userId, "UPDATE_CUSTOMER", "Customer ID " + payload.id + " diupdate");
  return { success: true, code: HTTP_CODES.OK, message: "Customer berhasil diupdate", data: updated };
}

function handleDeleteCustomer(payload, userId) {
  if (!payload.id) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Customer ID wajib disertakan" };
  }
  
  var success = deleteSheetRow(SHEETS.CUSTOMERS, payload.id);
  if (!success) {
    return { success: false, code: HTTP_CODES.NOT_FOUND, message: "Customer tidak ditemukan" };
  }
  
  logActivity(userId, "DELETE_CUSTOMER", "Customer ID " + payload.id + " dihapus");
  return { success: true, code: HTTP_CODES.OK, message: "Customer berhasil dihapus" };
}

// =============================================================================
// SECTION 12: PURCHASE
// =============================================================================
function handleGetPurchases(params) {
  var list = getSheetData(SHEETS.PURCHASES);
  var details = getSheetData(SHEETS.PURCHASE_DETAILS);
  var suppliers = getSheetData(SHEETS.SUPPLIERS);
  
  var result = list.map(function(p) {
    var sup = suppliers.find(function(s) { return s.id === p.supplierId; });
    var pDetails = details.filter(function(d) { return d.purchaseId === p.id; });
    return {
      id: p.id,
      poNumber: p.poNumber,
      date: p.date,
      supplierId: p.supplierId,
      supplierName: sup ? sup.name : "Unknown Supplier",
      userId: p.userId,
      total: Number(p.total),
      status: p.status,
      details: pDetails
    };
  });
  
  return paginateAndSort(result, params);
}

function handleCreatePurchase(payload, userId) {
  var valErrors = validatePayload(payload, {
    poNumber: { required: true },
    supplierId: { required: true, type: "uuid" },
    total: { required: true, type: "number" }
  });
  
  if (valErrors.length > 0) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: valErrors.join(" ") };
  }
  
  if (!payload.details || payload.details.length === 0) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Detail item pembelian wajib disertakan" };
  }
  
  payload.id = generateUuid();
  payload.userId = userId;
  payload.date = payload.date || new Date().toISOString();
  payload.status = payload.status || "lunas";
  
  // Insert Purchase Main
  appendSheetRow(SHEETS.PURCHASES, {
    id: payload.id,
    poNumber: payload.poNumber,
    date: payload.date,
    supplierId: payload.supplierId,
    userId: payload.userId,
    total: payload.total,
    status: payload.status
  });
  
  // Insert details & update stock
  payload.details.forEach(function(item) {
    var detailId = generateUuid();
    appendSheetRow(SHEETS.PURCHASE_DETAILS, {
      id: detailId,
      purchaseId: payload.id,
      productId: item.productId,
      qty: item.qty,
      price: item.price,
      subtotal: item.qty * item.price
    });
    
    // Add stock movement
    appendSheetRow(SHEETS.STOCK_MOVEMENTS, {
      id: generateUuid(),
      productId: item.productId,
      type: "IN",
      qty: item.qty,
      referenceId: payload.id,
      date: payload.date,
      note: "Pembelian PO No. " + payload.poNumber
    });
  });
  
  // If status is "hutang" (debt), create SupplierDebt record
  if (payload.status === "hutang") {
    appendSheetRow(SHEETS.SUPPLIER_DEBT, {
      id: generateUuid(),
      purchaseId: payload.id,
      supplierId: payload.supplierId,
      amount: payload.total,
      dueDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10), // 30 days default
      status: "unpaid"
    });
  }
  
  logActivity(userId, "CREATE_PURCHASE", "Pembelian PO " + payload.poNumber + " berhasil direkam");
  return { success: true, code: HTTP_CODES.CREATED, message: "Pembelian berhasil direkam", data: payload };
}

// =============================================================================
// SECTION 13: SALE
// =============================================================================
function handleGetSales(params) {
  var list = getSheetData(SHEETS.SALES);
  var details = getSheetData(SHEETS.SALES_DETAILS);
  var customers = getSheetData(SHEETS.CUSTOMERS);
  var users = getSheetData(SHEETS.USERS);
  
  var result = list.map(function(s) {
    var cust = customers.find(function(c) { return c.id === s.customerId; });
    var kasir = users.find(function(u) { return u.id === s.userId; });
    var sDetails = details.filter(function(d) { return d.saleId === s.id; });
    return {
      id: s.id,
      invoiceNo: s.invoiceNo,
      date: s.date,
      customerId: s.customerId,
      customerName: cust ? cust.name : "Umum (Walk-in)",
      userId: s.userId,
      kasirName: kasir ? kasir.name : "Sistem",
      subtotal: Number(s.subtotal),
      discount: Number(s.discount),
      total: Number(s.total),
      paymentMethod: s.paymentMethod,
      status: s.status,
      details: sDetails
    };
  });
  
  return paginateAndSort(result, params);
}

function handleCreateSale(payload, userId) {
  var valErrors = validatePayload(payload, {
    invoiceNo: { required: true },
    subtotal: { required: true, type: "number" },
    total: { required: true, type: "number" },
    paymentMethod: { required: true }
  });
  
  if (valErrors.length > 0) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: valErrors.join(" ") };
  }
  
  if (!payload.details || payload.details.length === 0) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Detail item penjualan wajib disertakan" };
  }
  
  payload.id = generateUuid();
  payload.userId = userId;
  payload.date = payload.date || new Date().toISOString();
  payload.status = payload.paymentMethod === "kasbon" ? "kasbon" : "completed";
  
  // Insert Sale Main
  appendSheetRow(SHEETS.SALES, {
    id: payload.id,
    invoiceNo: payload.invoiceNo,
    date: payload.date,
    customerId: payload.customerId || "",
    userId: payload.userId,
    subtotal: payload.subtotal,
    discount: payload.discount || 0,
    total: payload.total,
    paymentMethod: payload.paymentMethod,
    status: payload.status
  });
  
  // Insert details & update stock
  payload.details.forEach(function(item) {
    var detailId = generateUuid();
    appendSheetRow(SHEETS.SALES_DETAILS, {
      id: detailId,
      saleId: payload.id,
      productId: item.productId,
      qty: item.qty,
      price: item.price,
      subtotal: item.qty * item.price
    });
    
    // Add stock movement
    appendSheetRow(SHEETS.STOCK_MOVEMENTS, {
      id: generateUuid(),
      productId: item.productId,
      type: "OUT",
      qty: item.qty,
      referenceId: payload.id,
      date: payload.date,
      note: "Penjualan Invoice No. " + payload.invoiceNo
    });
  });
  
  // If payment method is kasbon, create Kasbon record
  if (payload.paymentMethod === "kasbon") {
    if (!payload.customerId) {
      return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Customer wajib diisi jika metode pembayaran Kasbon" };
    }
    appendSheetRow(SHEETS.KASBON, {
      id: generateUuid(),
      saleId: payload.id,
      customerId: payload.customerId,
      amount: payload.total,
      dueDate: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10), // 14 days default
      status: "unpaid"
    });
  }
  
  logActivity(userId, "CREATE_SALE", "Penjualan " + payload.invoiceNo + " berhasil disimpan");
  return { success: true, code: HTTP_CODES.CREATED, message: "Penjualan berhasil disimpan", data: payload };
}

function handleVoidSale(payload, userId) {
  if (!payload.id) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Sale ID wajib disertakan" };
  }
  
  var sale = updateSheetRow(SHEETS.SALES, payload.id, { status: "void" });
  if (!sale) {
    return { success: false, code: HTTP_CODES.NOT_FOUND, message: "Penjualan tidak ditemukan" };
  }
  
  // Revert stock movement (create opposite movement)
  var details = getSheetData(SHEETS.SALES_DETAILS).filter(function(d) { return d.saleId === payload.id; });
  details.forEach(function(item) {
    appendSheetRow(SHEETS.STOCK_MOVEMENTS, {
      id: generateUuid(),
      productId: item.productId,
      type: "IN",
      qty: item.qty,
      referenceId: payload.id,
      date: new Date().toISOString(),
      note: "Pembatalan (Void) Penjualan " + sale.invoiceNo
    });
  });
  
  // If Kasbon existed, mark paid/void
  var kasbons = getSheetData(SHEETS.KASBON);
  var kasbon = kasbons.find(function(k) { return k.saleId === payload.id; });
  if (kasbon) {
    updateSheetRow(SHEETS.KASBON, kasbon.id, { status: "paid", amount: 0 }); // effectively clear it
  }
  
  logActivity(userId, "VOID_SALE", "Penjualan " + sale.invoiceNo + " di-void");
  return { success: true, code: HTTP_CODES.OK, message: "Transaksi berhasil dibatalkan (void)" };
}

// =============================================================================
// SECTION 14: STOCK MOVEMENT
// =============================================================================
function handleGetStockMovements(params) {
  var list = getSheetData(SHEETS.STOCK_MOVEMENTS);
  var products = getSheetData(SHEETS.PRODUCTS);
  
  var result = list.map(function(sm) {
    var prod = products.find(function(p) { return p.id === sm.productId; });
    return {
      id: sm.id,
      productId: sm.productId,
      productName: prod ? prod.name : "Produk Terhapus",
      sku: prod ? prod.sku : "",
      type: sm.type,
      qty: Number(sm.qty),
      referenceId: sm.referenceId,
      date: sm.date,
      note: sm.note
    };
  });
  
  return paginateAndSort(result, params);
}

function handleCreateStockMovement(payload, userId) {
  var valErrors = validatePayload(payload, {
    productId: { required: true, type: "uuid" },
    type: { required: true },
    qty: { required: true, type: "number" }
  });
  
  if (valErrors.length > 0) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: valErrors.join(" ") };
  }
  
  payload.id = generateUuid();
  payload.date = payload.date || new Date().toISOString();
  payload.note = payload.note || "Penyesuaian manual oleh Staff";
  
  appendSheetRow(SHEETS.STOCK_MOVEMENTS, payload);
  
  logActivity(userId, "ADJUST_STOCK", "Manual adj. stock " + payload.productId + " type " + payload.type + " qty " + payload.qty);
  return { success: true, code: HTTP_CODES.CREATED, message: "Penyesuaian stok berhasil disimpan", data: payload };
}

// =============================================================================
// SECTION 15: KASBON
// =============================================================================
function handleGetKasbon(params) {
  var list = getSheetData(SHEETS.KASBON);
  var customers = getSheetData(SHEETS.CUSTOMERS);
  var payments = getSheetData(SHEETS.KASBON_PAYMENTS);
  
  var result = list.map(function(k) {
    var cust = customers.find(function(c) { return c.id === k.customerId; });
    var kPayments = payments.filter(function(p) { return p.kasbonId === k.id; });
    var totalPaid = kPayments.reduce(function(sum, p) { return sum + Number(p.amount); }, 0);
    
    return {
      id: k.id,
      saleId: k.saleId,
      customerId: k.customerId,
      customerName: cust ? cust.name : "Umum",
      amount: Number(k.amount),
      remainingAmount: Math.max(0, Number(k.amount) - totalPaid),
      dueDate: k.dueDate,
      status: k.status,
      payments: kPayments
    };
  });
  
  return paginateAndSort(result, params);
}

function handlePayKasbon(payload, userId) {
  var valErrors = validatePayload(payload, {
    kasbonId: { required: true, type: "uuid" },
    amount: { required: true, type: "number" }
  });
  
  if (valErrors.length > 0) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: valErrors.join(" ") };
  }
  
  var kasbons = getSheetData(SHEETS.KASBON);
  var kasbon = kasbons.find(function(k) { return k.id === payload.kasbonId; });
  if (!kasbon) {
    return { success: false, code: HTTP_CODES.NOT_FOUND, message: "Data kasbon tidak ditemukan" };
  }
  
  var payments = getSheetData(SHEETS.KASBON_PAYMENTS).filter(function(p) { return p.kasbonId === payload.kasbonId; });
  var totalPaid = payments.reduce(function(sum, p) { return sum + Number(p.amount); }, 0);
  var remaining = Number(kasbon.amount) - totalPaid;
  
  if (payload.amount > remaining) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Jumlah bayar melebihi sisa kasbon (" + remaining + ")" };
  }
  
  var payId = generateUuid();
  var payObj = {
    id: payId,
    kasbonId: payload.kasbonId,
    amount: payload.amount,
    date: new Date().toISOString(),
    userId: userId
  };
  appendSheetRow(SHEETS.KASBON_PAYMENTS, payObj);
  
  // Update Kasbon Status
  var newTotalPaid = totalPaid + payload.amount;
  var newStatus = "partial";
  if (newTotalPaid >= Number(kasbon.amount)) {
    newStatus = "paid";
  }
  updateSheetRow(SHEETS.KASBON, payload.kasbonId, { status: newStatus });
  
  logActivity(userId, "PAY_KASBON", "Pembayaran kasbon ID " + payload.kasbonId + " senilai " + payload.amount);
  return { success: true, code: HTTP_CODES.OK, message: "Pembayaran kasbon berhasil dicatat", data: payObj };
}

// =============================================================================
// SECTION 16: SUPPLIER DEBT
// =============================================================================
function handleGetSupplierDebt(params) {
  var list = getSheetData(SHEETS.SUPPLIER_DEBT);
  var suppliers = getSheetData(SHEETS.SUPPLIERS);
  var payments = getSheetData(SHEETS.SUPPLIER_DEBT_PAYMENTS);
  
  var result = list.map(function(d) {
    var sup = suppliers.find(function(s) { return s.id === d.supplierId; });
    var dPayments = payments.filter(function(p) { return p.supplierDebtId === d.id; });
    var totalPaid = dPayments.reduce(function(sum, p) { return sum + Number(p.amount); }, 0);
    
    return {
      id: d.id,
      purchaseId: d.purchaseId,
      supplierId: d.supplierId,
      supplierName: sup ? sup.name : "Supplier Terhapus",
      amount: Number(d.amount),
      remainingAmount: Math.max(0, Number(d.amount) - totalPaid),
      dueDate: d.dueDate,
      status: d.status,
      payments: dPayments
    };
  });
  
  return paginateAndSort(result, params);
}

function handlePaySupplierDebt(payload, userId) {
  var valErrors = validatePayload(payload, {
    supplierDebtId: { required: true, type: "uuid" },
    amount: { required: true, type: "number" }
  });
  
  if (valErrors.length > 0) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: valErrors.join(" ") };
  }
  
  var debts = getSheetData(SHEETS.SUPPLIER_DEBT);
  var debt = debts.find(function(d) { return d.id === payload.supplierDebtId; });
  if (!debt) {
    return { success: false, code: HTTP_CODES.NOT_FOUND, message: "Data hutang tidak ditemukan" };
  }
  
  var payments = getSheetData(SHEETS.SUPPLIER_DEBT_PAYMENTS).filter(function(p) { return p.supplierDebtId === payload.supplierDebtId; });
  var totalPaid = payments.reduce(function(sum, p) { return sum + Number(p.amount); }, 0);
  var remaining = Number(debt.amount) - totalPaid;
  
  if (payload.amount > remaining) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Jumlah bayar melebihi sisa hutang (" + remaining + ")" };
  }
  
  var payId = generateUuid();
  var payObj = {
    id: payId,
    supplierDebtId: payload.supplierDebtId,
    amount: payload.amount,
    date: new Date().toISOString(),
    userId: userId
  };
  appendSheetRow(SHEETS.SUPPLIER_DEBT_PAYMENTS, payObj);
  
  // Update status
  var newTotalPaid = totalPaid + payload.amount;
  var newStatus = "partial";
  if (newTotalPaid >= Number(debt.amount)) {
    newStatus = "paid";
  }
  updateSheetRow(SHEETS.SUPPLIER_DEBT, payload.supplierDebtId, { status: newStatus });
  
  logActivity(userId, "PAY_DEBT", "Pembayaran hutang supplier ID " + payload.supplierDebtId + " senilai " + payload.amount);
  return { success: true, code: HTTP_CODES.OK, message: "Pembayaran hutang berhasil dicatat", data: payObj };
}

// =============================================================================
// SECTION 17: BLOG
// =============================================================================
function handleGetBlogs(params) {
  var list = getSheetData(SHEETS.BLOGS);
  var categories = getSheetData(SHEETS.BLOG_CATEGORIES);
  
  var result = list.map(function(b) {
    var cat = categories.find(function(c) { return c.id === b.categoryId; });
    return {
      id: b.id,
      title: b.title,
      slug: b.slug,
      content: b.content,
      authorId: b.authorId,
      categoryId: b.categoryId,
      categoryName: cat ? cat.name : "Umum",
      coverImage: b.coverImage,
      status: b.status,
      createdAt: b.createdAt
    };
  });
  
  // Apply standard filters for visitor view (only published unless admin asks)
  if (params.publishedOnly === "true" || params.publishedOnly === true) {
    result = result.filter(function(r) { return r.status === "published"; });
  }
  
  return paginateAndSort(result, params);
}

function handleCreateBlog(payload, userId) {
  if (!payload.title || !payload.slug || !payload.content) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Judul, slug, dan isi blog wajib diisi" };
  }
  
  if (checkDuplicate(SHEETS.BLOGS, "slug", payload.slug)) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Slug blog sudah digunakan" };
  }
  
  payload.id = generateUuid();
  payload.authorId = userId;
  payload.status = payload.status || "draft";
  payload.createdAt = new Date().toISOString();
  
  appendSheetRow(SHEETS.BLOGS, payload);
  
  logActivity(userId, "CREATE_BLOG", "Artikel blog '" + payload.title + "' berhasil dibuat");
  return { success: true, code: HTTP_CODES.CREATED, message: "Artikel blog berhasil dibuat", data: payload };
}

function handleUpdateBlog(payload, userId) {
  if (!payload.id) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Blog ID wajib disertakan" };
  }
  
  if (payload.slug && checkDuplicate(SHEETS.BLOGS, "slug", payload.slug, payload.id)) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Slug blog sudah digunakan" };
  }
  
  var updated = updateSheetRow(SHEETS.BLOGS, payload.id, payload);
  if (!updated) {
    return { success: false, code: HTTP_CODES.NOT_FOUND, message: "Artikel tidak ditemukan" };
  }
  
  logActivity(userId, "UPDATE_BLOG", "Artikel blog ID " + payload.id + " diperbarui");
  return { success: true, code: HTTP_CODES.OK, message: "Artikel blog berhasil diperbarui", data: updated };
}

function handleDeleteBlog(payload, userId) {
  if (!payload.id) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Blog ID wajib disertakan" };
  }
  
  var success = deleteSheetRow(SHEETS.BLOGS, payload.id);
  if (!success) {
    return { success: false, code: HTTP_CODES.NOT_FOUND, message: "Artikel tidak ditemukan" };
  }
  
  logActivity(userId, "DELETE_BLOG", "Artikel blog ID " + payload.id + " dihapus");
  return { success: true, code: HTTP_CODES.OK, message: "Artikel blog berhasil dihapus" };
}

function handleGetBlogCategories(params) {
  var list = getSheetData(SHEETS.BLOG_CATEGORIES);
  return paginateAndSort(list, params);
}

function handleCreateBlogCategory(payload, userId) {
  if (!payload.name || !payload.slug) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Nama dan slug kategori blog wajib diisi" };
  }
  payload.id = generateUuid();
  appendSheetRow(SHEETS.BLOG_CATEGORIES, payload);
  return { success: true, code: HTTP_CODES.CREATED, message: "Kategori blog berhasil dibuat", data: payload };
}

function handleUpdateBlogCategory(payload, userId) {
  if (!payload.id) return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Category ID wajib disertakan" };
  var updated = updateSheetRow(SHEETS.BLOG_CATEGORIES, payload.id, payload);
  return { success: true, code: HTTP_CODES.OK, message: "Kategori blog berhasil diupdate", data: updated };
}

function handleDeleteBlogCategory(payload, userId) {
  if (!payload.id) return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Category ID wajib disertakan" };
  deleteSheetRow(SHEETS.BLOG_CATEGORIES, payload.id);
  return { success: true, code: HTTP_CODES.OK, message: "Kategori blog berhasil dihapus" };
}

// =============================================================================
// SECTION 18: MEDIA
// =============================================================================
function handleGetMedia(params) {
  var list = getSheetData(SHEETS.MEDIA);
  return paginateAndSort(list, params);
}

function handleCreateMedia(payload, userId) {
  if (!payload.fileName || !payload.url) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Nama file dan URL media wajib diisi" };
  }
  
  payload.id = generateUuid();
  payload.uploadedAt = new Date().toISOString();
  appendSheetRow(SHEETS.MEDIA, payload);
  
  logActivity(userId, "UPLOAD_MEDIA", "File media " + payload.fileName + " berhasil ditambahkan");
  return { success: true, code: HTTP_CODES.CREATED, message: "Media berhasil ditambahkan", data: payload };
}

function handleDeleteMedia(payload, userId) {
  if (!payload.id) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Media ID wajib disertakan" };
  }
  
  var success = deleteSheetRow(SHEETS.MEDIA, payload.id);
  if (!success) {
    return { success: false, code: HTTP_CODES.NOT_FOUND, message: "Media tidak ditemukan" };
  }
  
  logActivity(userId, "DELETE_MEDIA", "Media ID " + payload.id + " dihapus");
  return { success: true, code: HTTP_CODES.OK, message: "Media berhasil dihapus" };
}

// =============================================================================
// SECTION 19: PROMOTION
// =============================================================================
function handleGetPromotions(params) {
  var list = getSheetData(SHEETS.PROMOTIONS);
  var products = getSheetData(SHEETS.PRODUCTS);
  
  var result = list.map(function(p) {
    var prod = products.find(function(pr) { return pr.id === p.productId; });
    return {
      id: p.id,
      name: p.name,
      productId: p.productId,
      productName: prod ? prod.name : "Semua Produk",
      discountType: p.discountType,
      discountValue: Number(p.discountValue),
      startDate: p.startDate,
      endDate: p.endDate,
      isActive: p.isActive === true || p.isActive === "TRUE" || p.isActive === 1
    };
  });
  
  return paginateAndSort(result, params);
}

function handleCreatePromotion(payload, userId) {
  if (!payload.name || !payload.discountType || !payload.discountValue) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Nama, jenis, dan nilai diskon promosi wajib diisi" };
  }
  
  payload.id = generateUuid();
  payload.isActive = payload.isActive !== undefined ? payload.isActive : true;
  appendSheetRow(SHEETS.PROMOTIONS, payload);
  
  logActivity(userId, "CREATE_PROMOTION", "Promosi " + payload.name + " dibuat");
  return { success: true, code: HTTP_CODES.CREATED, message: "Promosi berhasil dibuat", data: payload };
}

function handleUpdatePromotion(payload, userId) {
  if (!payload.id) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Promotion ID wajib disertakan" };
  }
  
  var updated = updateSheetRow(SHEETS.PROMOTIONS, payload.id, payload);
  if (!updated) {
    return { success: false, code: HTTP_CODES.NOT_FOUND, message: "Promosi tidak ditemukan" };
  }
  
  logActivity(userId, "UPDATE_PROMOTION", "Promosi ID " + payload.id + " diupdate");
  return { success: true, code: HTTP_CODES.OK, message: "Promosi berhasil diupdate", data: updated };
}

function handleDeletePromotion(payload, userId) {
  if (!payload.id) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Promotion ID wajib disertakan" };
  }
  
  var success = deleteSheetRow(SHEETS.PROMOTIONS, payload.id);
  if (!success) {
    return { success: false, code: HTTP_CODES.NOT_FOUND, message: "Promosi tidak ditemukan" };
  }
  
  logActivity(userId, "DELETE_PROMOTION", "Promosi ID " + payload.id + " dihapus");
  return { success: true, code: HTTP_CODES.OK, message: "Promosi berhasil dihapus" };
}

// BANNERS
function handleGetBanners(params) {
  var list = getSheetData(SHEETS.BANNERS);
  var result = list.map(function(b) {
    return {
      id: b.id,
      title: b.title,
      imageUrl: b.imageUrl,
      link: b.link,
      isActive: b.isActive === true || b.isActive === "TRUE" || b.isActive === 1,
      position: Number(b.position || 0)
    };
  });
  return paginateAndSort(result, params);
}

function handleCreateBanner(payload, userId) {
  if (!payload.title || !payload.imageUrl) return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Title dan image URL wajib diisi" };
  payload.id = generateUuid();
  payload.isActive = payload.isActive !== undefined ? payload.isActive : true;
  payload.position = payload.position || 0;
  appendSheetRow(SHEETS.BANNERS, payload);
  return { success: true, code: HTTP_CODES.CREATED, message: "Banner berhasil ditambahkan", data: payload };
}

function handleUpdateBanner(payload, userId) {
  if (!payload.id) return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Banner ID wajib" };
  var updated = updateSheetRow(SHEETS.BANNERS, payload.id, payload);
  return { success: true, code: HTTP_CODES.OK, message: "Banner diupdate", data: updated };
}

function handleDeleteBanner(payload, userId) {
  if (!payload.id) return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Banner ID wajib" };
  deleteSheetRow(SHEETS.BANNERS, payload.id);
  return { success: true, code: HTTP_CODES.OK, message: "Banner berhasil dihapus" };
}

// =============================================================================
// SECTION 20: NOTIFICATION
// =============================================================================
function handleGetNotifications(params, userId) {
  var list = getSheetData(SHEETS.NOTIFICATIONS);
  var filtered = list.filter(function(n) {
    return n.userId === userId || n.userId === "all";
  });
  
  var result = filtered.map(function(n) {
    return {
      id: n.id,
      userId: n.userId,
      title: n.title,
      message: n.message,
      isRead: n.isRead === true || n.isRead === "TRUE" || n.isRead === 1,
      createdAt: n.createdAt
    };
  });
  
  return paginateAndSort(result, params);
}

function handleReadNotification(payload, userId) {
  if (!payload.id) {
    return { success: false, code: HTTP_CODES.BAD_REQUEST, message: "Notification ID wajib disertakan" };
  }
  
  var updated = updateSheetRow(SHEETS.NOTIFICATIONS, payload.id, { isRead: true });
  if (!updated) {
    return { success: false, code: HTTP_CODES.NOT_FOUND, message: "Notifikasi tidak ditemukan" };
  }
  
  return { success: true, code: HTTP_CODES.OK, message: "Notifikasi ditandai telah dibaca", data: updated };
}

function createSystemNotification(userId, title, message) {
  appendSheetRow(SHEETS.NOTIFICATIONS, {
    id: generateUuid(),
    userId: userId || "all",
    title: title,
    message: message,
    isRead: false,
    createdAt: new Date().toISOString()
  });
}

// =============================================================================
// SECTION 21: SETTINGS
// =============================================================================
function handleGetWebsiteSettings() {
  var rawData = getSheetData(SHEETS.WEBSITE_SETTINGS);
  var settings = {};
  rawData.forEach(function(row) {
    if (row.key) settings[row.key] = row.value;
  });
  
  return {
    success: true,
    code: HTTP_CODES.OK,
    message: "Pengaturan website berhasil dimuat",
    data: settings
  };
}

function handleUpdateWebsiteSettings(payload, userId) {
  var sheet = getSheet(SHEETS.WEBSITE_SETTINGS);
  var lastRow = sheet.getLastRow();
  var keysRange = lastRow >= 2 ? sheet.getRange(2, 1, lastRow - 1, 1).getValues().map(function(r) { return r[0]; }) : [];
  
  for (var k in payload) {
    var keyIndex = keysRange.indexOf(k);
    if (keyIndex !== -1) {
      // Update value
      sheet.getRange(keyIndex + 2, 2).setValue(payload[k]);
    } else {
      // Insert new setting row
      sheet.appendRow([k, payload[k]]);
    }
  }
  
  logActivity(userId, "UPDATE_SETTINGS", "Pengaturan website diubah");
  return handleGetWebsiteSettings();
}

// =============================================================================
// SECTION 22: ANALYTICS
// =============================================================================
function handleGetAnalyticsSettings() {
  var rawData = getSheetData(SHEETS.ANALYTICS_SETTINGS);
  var settings = {};
  rawData.forEach(function(row) {
    if (row.key) settings[row.key] = row.value;
  });
  
  return {
    success: true,
    code: HTTP_CODES.OK,
    message: "Pengaturan Analytics berhasil dimuat",
    data: settings
  };
}

function handleUpdateAnalyticsSettings(payload, userId) {
  var sheet = getSheet(SHEETS.ANALYTICS_SETTINGS);
  var lastRow = sheet.getLastRow();
  var keysRange = lastRow >= 2 ? sheet.getRange(2, 1, lastRow - 1, 1).getValues().map(function(r) { return r[0]; }) : [];
  
  for (var k in payload) {
    var keyIndex = keysRange.indexOf(k);
    if (keyIndex !== -1) {
      sheet.getRange(keyIndex + 2, 2).setValue(payload[k]);
    } else {
      sheet.appendRow([k, payload[k]]);
    }
  }
  
  logActivity(userId, "UPDATE_ANALYTICS", "Pengaturan Analytics diubah");
  return handleGetAnalyticsSettings();
}

// =============================================================================
// SECTION 23: REPORT
// =============================================================================
function handleGetSalesReport(params) {
  var sales = getSheetData(SHEETS.SALES);
  var details = getSheetData(SHEETS.SALES_DETAILS);
  var products = getSheetData(SHEETS.PRODUCTS);
  
  var startDate = params.startDate ? new Date(params.startDate) : null;
  var endDate = params.endDate ? new Date(params.endDate) : null;
  
  var filteredSales = sales.filter(function(s) {
    if (s.status === "void") return false;
    var saleDate = new Date(s.date);
    if (startDate && saleDate < startDate) return false;
    if (endDate && saleDate > endDate) return false;
    return true;
  });
  
  // Calculate Profits, Margins
  var totalRevenue = 0;
  var totalCost = 0;
  
  var productMap = {};
  products.forEach(function(p) {
    productMap[p.id] = Number(p.buyPrice);
  });
  
  var saleIds = filteredSales.map(function(s) { return s.id; });
  var filteredDetails = details.filter(function(d) {
    return saleIds.indexOf(d.saleId) !== -1;
  });
  
  filteredDetails.forEach(function(d) {
    var qty = Number(d.qty);
    var sellVal = Number(d.subtotal);
    var buyPrice = productMap[d.productId] || 0;
    var costVal = qty * buyPrice;
    
    totalRevenue += sellVal;
    totalCost += costVal;
  });
  
  var grossProfit = totalRevenue - totalCost;
  var profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  
  return {
    success: true,
    code: HTTP_CODES.OK,
    message: "Laporan penjualan berhasil di-generate",
    data: {
      summary: {
        transactionCount: filteredSales.length,
        totalRevenue: totalRevenue,
        totalCost: totalCost,
        grossProfit: grossProfit,
        profitMarginPercentage: parseFloat(profitMargin.toFixed(2))
      },
      salesList: filteredSales
    }
  };
}

// =============================================================================
// SECTION 24: UTILITIES
// =============================================================================
function paginateAndSort(dataList, params) {
  var search = params.search || "";
  var sortBy = params.sortBy || "id";
  var sortOrder = params.sortOrder || "asc";
  var page = Number(params.page || 1);
  var perPage = Number(params.perPage || 20);
  
  // 1. Search Filter (Case insensitive across all values)
  var filtered = dataList;
  if (search !== "") {
    var q = search.toLowerCase();
    filtered = dataList.filter(function(row) {
      return Object.keys(row).some(function(key) {
        return row[key] && row[key].toString().toLowerCase().indexOf(q) !== -1;
      });
    });
  }
  
  // 2. Sort
  filtered.sort(function(a, b) {
    var valA = a[sortBy];
    var valB = b[sortBy];
    
    // Treat as string/number safely
    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();
    
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });
  
  // 3. Paginate
  var total = filtered.length;
  var totalPages = Math.ceil(total / perPage);
  var startIndex = (page - 1) * perPage;
  var paginatedItems = filtered.slice(startIndex, startIndex + perPage);
  
  return {
    success: true,
    code: HTTP_CODES.OK,
    message: "Data berhasil dimuat",
    data: {
      items: paginatedItems,
      total: total,
      page: page,
      perPage: perPage,
      totalPages: totalPages
    }
  };
}

function generateUuid() {
  return Utilities.getUuid();
}

function logActivity(userId, action, details) {
  try {
    appendSheetRow(SHEETS.ACTIVITY_LOGS, {
      id: generateUuid(),
      userId: userId || "system",
      action: action,
      details: details,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    // Fail-safe to avoid blocking main operation
    Logger.log("Gagal mencatat log aktivitas: " + e.message);
  }
}

// =============================================================================
// DATABASE INITIALIZATION UTILITY
// =============================================================================
function initializeDatabase() {
  var db = getDb();
  var sheetDefinitions = [
    { name: SHEETS.USERS, headers: ["id", "name", "username", "passwordHash", "roleId", "status", "createdAt"] },
    { name: SHEETS.ROLES, headers: ["id", "name", "permissions"] },
    { name: SHEETS.CATEGORIES, headers: ["id", "name", "slug", "description"] },
    { name: SHEETS.PRODUCTS, headers: ["id", "categoryId", "name", "slug", "sku", "barcode", "buyPrice", "sellPrice", "unit", "isActive"] },
    { name: SHEETS.PRODUCT_IMAGES, headers: ["id", "productId", "imageUrl", "isPrimary"] },
    { name: SHEETS.SUPPLIERS, headers: ["id", "name", "contact", "address"] },
    { name: SHEETS.CUSTOMERS, headers: ["id", "name", "phone", "address", "type"] },
    { name: SHEETS.SALES, headers: ["id", "invoiceNo", "date", "customerId", "userId", "subtotal", "discount", "total", "paymentMethod", "status"] },
    { name: SHEETS.SALES_DETAILS, headers: ["id", "saleId", "productId", "qty", "price", "subtotal"] },
    { name: SHEETS.PURCHASES, headers: ["id", "poNumber", "date", "supplierId", "userId", "total", "status"] },
    { name: SHEETS.PURCHASE_DETAILS, headers: ["id", "purchaseId", "productId", "qty", "price", "subtotal"] },
    { name: SHEETS.STOCK_MOVEMENTS, headers: ["id", "productId", "type", "qty", "referenceId", "date", "note"] },
    { name: SHEETS.KASBON, headers: ["id", "saleId", "customerId", "amount", "dueDate", "status"] },
    { name: SHEETS.KASBON_PAYMENTS, headers: ["id", "kasbonId", "amount", "date", "userId"] },
    { name: SHEETS.SUPPLIER_DEBT, headers: ["id", "purchaseId", "supplierId", "amount", "dueDate", "status"] },
    { name: SHEETS.SUPPLIER_DEBT_PAYMENTS, headers: ["id", "supplierDebtId", "amount", "date", "userId"] },
    { name: SHEETS.BLOGS, headers: ["id", "title", "slug", "content", "authorId", "categoryId", "coverImage", "status", "createdAt"] },
    { name: SHEETS.BLOG_CATEGORIES, headers: ["id", "name", "slug"] },
    { name: SHEETS.MEDIA, headers: ["id", "fileName", "url", "type", "uploadedAt"] },
    { name: SHEETS.BANNERS, headers: ["id", "title", "imageUrl", "link", "isActive", "position"] },
    { name: SHEETS.PROMOTIONS, headers: ["id", "name", "productId", "discountType", "discountValue", "startDate", "endDate", "isActive"] },
    { name: SHEETS.NOTIFICATIONS, headers: ["id", "userId", "title", "message", "isRead", "createdAt"] },
    { name: SHEETS.ACTIVITY_LOGS, headers: ["id", "userId", "action", "details", "timestamp"] },
    { name: SHEETS.WEBSITE_SETTINGS, headers: ["key", "value"] },
    { name: SHEETS.ANALYTICS_SETTINGS, headers: ["key", "value"] }
  ];
  
  var logInfo = [];
  
  sheetDefinitions.forEach(function(def) {
    var sheet = db.getSheetByName(def.name);
    if (!sheet) {
      sheet = db.insertSheet(def.name);
      sheet.appendRow(def.headers);
      
      // Styling Header Row
      var headerRange = sheet.getRange(1, 1, 1, def.headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#3b82f6"); // Premium Sleek Blue
      headerRange.setFontColor("#ffffff");
      
      logInfo.push("Sheet '" + def.name + "' berhasil dibuat.");
    } else {
      logInfo.push("Sheet '" + def.name + "' sudah ada.");
    }
  });
  
  // Populate Default Roles & Default User
  var rolesSheet = db.getSheetByName(SHEETS.ROLES);
  if (rolesSheet.getLastRow() < 2) {
    var roleOwnerId = generateUuid();
    var roleAdminId = generateUuid();
    var roleKasirId = generateUuid();
    
    rolesSheet.appendRow([roleOwnerId, "owner", "*"]);
    rolesSheet.appendRow([roleAdminId, "admin", "dashboard.read,products.*,categories.*,suppliers.*,customers.*,sales.read,sales.create,purchases.*,stock.*,kasbon.*,debt.*,blog.*,media.*,promotion.*,settings.read,reports.read,analytics.read"]);
    rolesSheet.appendRow([roleKasirId, "kasir", "dashboard.read,products.read,categories.read,customers.*,sales.create,sales.read,kasbon.read,kasbon.create,notifications.read"]);
    
    // Seed First User (owner:owner123)
    var usersSheet = db.getSheetByName(SHEETS.USERS);
    if (usersSheet.getLastRow() < 2) {
      usersSheet.appendRow([
        generateUuid(),
        "Owner TB NS Jaya",
        "owner",
        hashPassword("owner123"), // default password
        roleOwnerId,
        "active",
        new Date().toISOString()
      ]);
    }
  }
  
  // Seed Default Website Settings
  var settingsSheet = db.getSheetByName(SHEETS.WEBSITE_SETTINGS);
  if (settingsSheet.getLastRow() < 2) {
    settingsSheet.appendRow(["companyName", "TB NS Jaya"]);
    settingsSheet.appendRow(["logoUrl", "https://tbnsjaya.com/logo.png"]);
    settingsSheet.appendRow(["waNumber", "6281234567890"]);
    settingsSheet.appendRow(["address", "Jl. Raya TB NS Jaya No. 1, Jakarta, Indonesia"]);
    settingsSheet.appendRow(["email", "contact@tbnsjaya.com"]);
    settingsSheet.appendRow(["operationalHours", "08:00 - 17:00 WIB"]);
    settingsSheet.appendRow(["gmapsUrl", "https://maps.google.com/?q=TB+NS+Jaya"]);
  }
  
  // Seed Default Analytics Settings
  var analyticsSheet = db.getSheetByName(SHEETS.ANALYTICS_SETTINGS);
  if (analyticsSheet.getLastRow() < 2) {
    analyticsSheet.appendRow(["NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-XXXXXXXXXX"]);
    analyticsSheet.appendRow(["NEXT_PUBLIC_GTM_ID", "GTM-XXXXXXX"]);
  }
  
  return {
    success: true,
    code: HTTP_CODES.OK,
    message: "Database initialization completed.",
    data: logInfo
  };
}
