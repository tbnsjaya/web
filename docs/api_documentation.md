# API Documentation - TB NS Jaya REST API Backend

Arsitektur komunikasi API menggunakan Google Apps Script Web App (REST API) yang memanipulasi Google Spreadsheet database.

## endpoint Base URL
`https://script.google.com/macros/s/AKfycbw78VLFu2utibnz7T2PheYMW-O3R7i-fbDeFM8e9BmiX32dNNgofJ_xzUNhsQPe_mnpIA/exec`

Semua request menggunakan HTTP POST (karena batasan Google Apps Script) dengan format payload JSON:
```json
{
  "action": "namaAction",
  "token": "JWT_TOKEN",
  "params": {}
}
```

---

## 1. Authentication
### `login`
- **Params**:
  ```json
  {
    "username": "owner",
    "password": "password"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "code": 200,
    "message": "Login berhasil",
    "data": {
      "token": "JWT_TOKEN",
      "user": { "id": "1", "username": "owner", "roleName": "owner" }
    }
  }
  ```

---

## 2. Products
### `getProducts`
- **Params**: `{}` (Mendukung filter search/pagination)
- **Response**:
  ```json
  {
    "success": true,
    "code": 200,
    "data": {
      "items": [
        { "id": "prod-1", "name": "Semen Gresik 50kg", "sku": "SMN-GRS", "buyPrice": 50000, "sellPrice": 62000, "currentStock": 35 }
      ]
    }
  }
  ```

### `createProduct`
- **Params**:
  ```json
  {
    "name": "Cat Nippon Paint 5kg",
    "slug": "cat-nippon-paint-5kg",
    "sku": "CAT-NPN-5",
    "buyPrice": 120000,
    "sellPrice": 145000,
    "unit": "pail",
    "categoryId": "cat-1",
    "isActive": true
  }
  ```

---

## 3. POS & Sales
### `createSale`
- **Params**:
  ```json
  {
    "invoiceNo": "INV-123456",
    "customerId": "cust-1",
    "subtotal": 120000,
    "discount": 10000,
    "total": 110000,
    "paymentMethod": "cash",
    "details": [
      { "productId": "prod-1", "qty": 2, "price": 60000 }
    ]
  }
  ```

---

## 4. Kasbon (Customer Receivables)
### `payKasbon`
- **Params**:
  ```json
  {
    "kasbonId": "kas-1",
    "amount": 50000
  }
  ```
