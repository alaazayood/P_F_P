# وثائق واجهة برمجة التطبيقات (API Documentation)

يوفر النظام واجهة برمجة تطبيقات RESTful. جميع الردود تكون بصيغة JSON.

**Base URL:** `http://localhost:4000/api`

---

## 🔐 المصادقة (Authentication)

### 1. تسجيل حساب جديد
**Endpoint:** `POST /auth/register`

يقوم بإنشاء حساب جديد (غير مفعل) ويرسل كود التحقق إلى البريد الإلكتروني.

**Body Parameters:**
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `email` | string | البريد الإلكتروني (يجب أن يكون فريداً) |
| `password` | string | كلمة المرور (6 أحرف على الأقل) |
| `first_name` | string | الاسم الأول |
| `last_name` | string | اسم العائلة |
| `customer_type` | string | `individual` أو `company` |
| `phone` | string | رقم الهاتف |
| `company_name` | string | (اختياري) مطلوب فقط إذا كان النوع `company` |

**Success Response (201 Created):**
```json
{
  "message": "Registration successful. Please check your email for verification code.",
  "userId": 123
}
```

### 2. تسجيل الدخول
**Endpoint:** `POST /auth/login`

**Body Parameters:**
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `email` | string | البريد الإلكتروني المسجل |
| `password` | string | كلمة المرور |

**Success Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "role": "user"
  }
}
```

### 3. التحقق من الحساب (Verify Email)
**Endpoint:** `POST /auth/verify`

**Body Parameters:**
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `email` | string | البريد الإلكتروني |
| `code` | string | كود التحقق المكون من 6 أرقام |

**Success Response (200 OK):**
```json
{
  "message": "Email verified successfully",
  "token": "..." // (اختياري: قد يتم تسجيل الدخول مباشرة)
}
```

### 4. إعادة إرسال كود التحقق
**Endpoint:** `POST /auth/resend`

**Body Parameters:**
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `email` | string | البريد الإلكتروني |

### 5. الملف الشخصي (Profile)
**Endpoint:** `GET /auth/profile`
**Headers:** `Authorization: Bearer <TOKEN>`

يعيد بيانات المستخدم الحالي.

---

## 🛡️ الإدارة (Admin)
> تتطلب هذه المسارات توكن لمستخدم بصلاحية `admin`.

### 1. إنشاء ترخيص (Create License)
**Endpoint:** `POST /admin/licenses`
**Headers:** `Authorization: Bearer <TOKEN>`

**Body Parameters:**
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `customerId` | number | معرف العميل |
| `type` | string | نوع الترخيص (`monthly`, `yearly`) |
| `seats` | number | عدد المقاعد |

### 2. عرض التراخيص
**Endpoint:** `GET /admin/licenses`
**Headers:** `Authorization: Bearer <TOKEN>`

---

## ⚠️ رموز الحالة (Status Codes)
- **200 OK:** العملية تمت بنجاح.
- **201 Created:** تم إنشاء المورد بنجاح.
- **400 Bad Request:** خطأ في البيانات المرسلة (Validation Error).
- **401 Unauthorized:** لم يتم تقديم توكن صالح أو فشل تسجيل الدخول.
- **403 Forbidden:** ليس لديك صلاحية للوصول لهذا المورد.
- **404 Not Found:** المورد غير موجود.
- **500 Internal Server Error:** خطأ في الخادم.
