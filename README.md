
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

## ⚡ **Scaling to 1,000 Requests/Second**

To handle high RPS:

### **1. Caching Layer**

* Add **Redis** to cache:

  * frequently requested offers
  * precomputed results for common payment combinations
    This reduces database hits drastically.

### **2. Indexing in MongoDB**

Create indexes on:

* `bankName`
* `paymentInstrument`
* `startDate`, `endDate`

This makes querying 10× faster.

### **3. Clustered Node.js**

Use PM2 cluster mode:

```
pm2 start index.js -i max
```

### **4. Load Balancer**

Deploy behind:

* Nginx
* AWS ALB
* Cloudflare

---

## 🔧 **What I Would Improve With More Time**

* Add **unit tests** (Jest) for discount logic.
* Add Swagger/OpenAPI documentation.
* Build an admin panel to manage offers visually.
* Add rate limiting + security middleware.
* Optimize discount algorithm for edge cases.
* Add basic tests to check if discount calculations are always correct.
* Improve error handling so the API gives cleaner messages instead of crashing.
* Add input validation to prevent wrong or missing fields from breaking the API.
* Make the code cleaner by separating more logic into helper files.
* Add logging so it’s easier to debug what happened during a request.
* Add API documentation so anyone can quickly understand how to use the endpoints.
* Improve performance by caching repeated calculations.
* Add simple security features like rate limiting and helmet middleware.
* Add a small admin page to easily view and edit offers instead of using MongoDB manually.

---

## 📌 **Note**

This assignment uses Flipkart’s Offer API data structure **only for evaluation**.
It is not affiliated with Flipkart in any way.
