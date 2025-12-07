
# **PiePay Assignment – Backend Offer Engine**

A simple Node.js + Express + MongoDB backend that stores offers and calculates the **highest applicable discount** for a user based on the provided payment method and amount.

---

## 🚀 **Project Setup**

### **1. Clone the Repository**

```bash
git clone https://github.com/darsh609/PiePayAssgn.git
cd PiePayAssgn
```

---

### **2. Install Dependencies**

Make sure you have **Node.js** and **npm** installed.

```bash
npm install
```

This installs:

* express
* mongoose
* dotenv
* nodemon
* crypto
* body-parser

---

### **3. Environment Variables**

Create a `.env` file in the project root:

```
PORT=5000
MONGO_URI=mongodb+srv://darshkumar0609_db_user:NUvvlxI71kKrRxNQ@cluster0.sz0h28s.mongodb.net/
```

(Use your actual MongoDB credentials privately — do **not** push them to GitHub.)

---

### **4. Start the Server**

For development (auto-restart):

```bash
npm run dev
```

For production:

```bash
npm start
```

Server runs at:

```
http://localhost:5000
```

---

## 📌 **Project Structure**

```
PiePayAssgn/
│── models/
│── routes/
│── controllers/
│── index.js
│── package.json
│── README.md
│── .env
```

---

## 📡 **Available Endpoints**

### **1. Add Offer**

```
POST /offer
```

Adds a new offer to MongoDB.

### **2. Get Highest Discount**

```
GET /highest-discount?amountToPay=X&bankName=Y&paymentInstrument=Z
```

Returns the **best matching discount** based on rules.

---

## 🧠 **Assumptions Made**

1. The logic assumes **percentage discount** and **flat discount** and selects the higher applicable one.
2. The API expects `bankName`, `paymentInstrument`, and `amountToPay`.
3. All dates are stored and validated in ISO format.
4. Offers are considered valid only if they fall within start–end date.
5. For simplicity, all offers are assumed to have:

   * `minAmount`
   * `maxDiscount`
   * `discountType` (PERCENTAGE / FLAT)

---

## 🏗 **Design Choices Explained**

### **1. Tech Stack**

* **Express.js** — lightweight, fast, and perfect for small REST APIs.
* **Mongoose** — simplifies MongoDB schema design and querying.
* **MongoDB** — flexible schema, ideal for offer-based dynamic rules.

### **2. Database Schema**

The offer schema includes:

* offer validity
* bank eligibility
* payment method
* discount rules
* metadata like start & end dates

This allows fast filtering before computing discounts.

### **3. Controller + Route Structure**

Separated for:

* Clean code
* Easier debugging
* Scalability

---

## ⚡ Scaling to 1,000 Requests Per Second

To make the `/highest-discount` API fast and scalable, here are simple improvements:

### 1. Add Caching (Redis)
Store frequently requested discount results in Redis.  
If the same request comes again, return the cached value instead of calculating again.  
This reduces MongoDB load and improves speed.

### 2. Add MongoDB Indexes
Add indexes to fields commonly used in queries:
- bankName
- paymentInstrument

Indexes help MongoDB search faster without scanning the full collection.

### 3. Horizontal Scaling (Run Multiple Backend Servers)
Run multiple instances of the Node.js server.  
This lets the system handle more requests at the same time.

### 4. Use a Load Balancer
Use Nginx, AWS ALB, or Cloudflare as a load balancer.  
It distributes traffic evenly across all backend servers and prevents overload.

### 5. Optimize Database Queries
Keep database queries simple and efficient:
- Query only required fields
- Avoid unnecessary loops or heavy logic
- Limit returned data to only what is required

Less processing inside the server = faster API responses.

---

# 🔧 **What I Would Improve With More Time**

If I had more time, I would add a few improvements to make the project more reliable, faster, and easier to work with:

### ✅ **1. Add Basic Tests**

* Write simple tests (using Jest) to check whether the discount calculation is always correct.
* This helps catch mistakes early.

### ✅ **2. Better Error Handling**

* Make sure the API returns clean and clear error messages instead of crashing.
* Helps users understand exactly what went wrong.

### ✅ **3. Add Input Validation**

* Use a validation library (like Joi/Zod) to ensure that important fields are not missing or incorrect.
* Prevents invalid data from entering the system.

### ✅ **4. Clean Up the Code Structure**

* Move calculations and helper logic into separate utility files.
* Makes the code easier to read and maintain.

### ✅ **5. Improve Performance With Caching**

* Cache repeated discount calculations to reduce load on MongoDB and speed up responses.

### ✅ **6. Add Basic Security**

* Add rate limiting and security middleware (like helmet) to prevent abuse.

### ✅ **7. Create a Simple Admin Panel**

* A small UI to view / edit / add offers without going to MongoDB directly.

---

## 📌 **Note**

This assignment uses Flipkart’s Offer API data structure **only for evaluation**.
It is not affiliated with Flipkart in any way.
