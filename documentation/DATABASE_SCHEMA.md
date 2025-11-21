
## 📄 **4. ملف: documentation/DATABASE_SCHEMA.md**

```markdown
# مخطط قاعدة البيانات

## 📊 جدول المستخدمين (users)
```sql
CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role ENUM('admin', 'user') DEFAULT 'user',
  is_verified BOOLEAN DEFAULT FALSE,
  verification_code VARCHAR(10),
  verification_code_expires DATETIME,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);
🏢 جدول العملاء (customers)
sql
CREATE TABLE customers (
  customer_id INT PRIMARY KEY AUTO_INCREMENT,
  company_name VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  customer_type ENUM('company', 'individual') NOT NULL,
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
📜 جدول التراخيص (licenses)
sql
CREATE TABLE licenses (
  license_id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT NOT NULL,
  license_type ENUM('monthly', 'yearly') NOT NULL,
  seat_count INT NOT NULL,
  status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);