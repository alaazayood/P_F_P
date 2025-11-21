# وثائق API - PowerFlow System

## 🔐 مصادقة (Authentication)

### تسجيل مستخدم جديد
**Endpoint**: `POST /api/auth/register`

**Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "customer_type": "individual",
  "phone": "+1234567890"
} 
Response:

json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification code.",
  "email": "user@example.com"
}
تحقق من البريد
Endpoint: POST /api/auth/verify

Body: 
{
  "email": "user@example.com",
  "code": "1234"
}
دخول مستخدم
Endpoint: POST /api/auth/login

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "admin"
  }
}
👨‍💼 إدارة (Admin)
إنشاء ترخيص
Endpoint: POST /api/admin/licenses

Headers: Authorization: Bearer <token>

Body:{
  "customer_id": 1,
  "license_type": "yearly",
  "seat_count": 5
}
