
# 🛒 **Flipkart Offer Extraction & Discount Engine — Backend Service**

> **A lightweight Node.js service that parses Flipkart’s offer API, stores structured offers, and computes the highest applicable discount for a user based on bank + payment instrument.**

---

## 📜 **Table of Contents**

* [🚀 Project Setup](#-project-setup)
* [🧩 API Endpoints](#-api-endpoints)
* [📌 Assumptions](#-assumptions)
* [🏗 Design Choices](#-design-choices)
* [⚡ Scaling Strategy — 1000 RPS](#-scaling-strategy--1000-rps)
* [🚀 Future Improvements](#-future-improvements)
* [📘 Disclaimer](#-disclaimer)

---

# 🚀 **Project Setup**

### **1️⃣ Clone the project**

```bash
git clone <your-repo-url>
cd flipkart-offer-service
```

---

### **2️⃣ Install dependencies**

```bash
npm install
```

---

### **3️⃣ Environment setup**

Create a `./.env` file:

```
PORT=4000
MONGO_URI=mongodb://localhost:27017/offerdb
```

---

### **4️⃣ Start MongoDB**

(on your system or via Docker)

**Local MongoDB**

```bash
mongod
```

**Or using Docker**

```bash
docker run -d -p 27017:27017 mongo
```

---

### **5️⃣ Start the server**

```bash
npm start
```

Server will run on:
👉 `http://localhost:4000`

> **No migrations required.**
> Database collections are auto-created via Mongoose.

---

# 🧩 **API Endpoints**

---

## **1️⃣ POST /offer**

Extracts and stores all offers from Flipkart’s offer API raw response.

### **Request Body**

```json
{
  "flipkartOfferApiResponse": { ... }
}
```

### **Response**

```json
{
  "noOfOffersIdentified": 12,
  "noOfNewOffersCreated": 9
}
```

---

## **2️⃣ GET /highest-discount**

Compute the **maximum discount** for the given bank & payment instrument.

### **Query Params**

| Param             | Type   | Required | Example |
| ----------------- | ------ | -------- | ------- |
| amountToPay       | number | Yes      | 10000   |
| bankName          | string | Yes      | AXIS    |
| paymentInstrument | string | No       | CREDIT  |

---

### **Example Request**

```
GET /highest-discount?amountToPay=15000&bankName=AXIS&paymentInstrument=CREDIT
```

### **Example Response**

```json
{
  "highestDiscountAmount": 1500
}
```

---

# 📌 **Assumptions**

To complete the assignment within the required time, the following assumptions were made:

### **1. Flipkart’s offer API structure is stable**

The shape of:

```
paymentOptions.items → OFFER_LIST → data.offers.offerList
```

is consistent enough to parse.

---

### **2. Payment instruments are inferred**

Flipkart does NOT explicitly provide:

```
CREDIT, EMI_OPTIONS, DEBIT, UPI
```

So instruments are derived based on:

* Provider names
* Offer text
* Keywords like “EMI”, “No Cost EMI”, “Debit Card”

---

### **3. Bank matching uses substring logic**

Flipkart provides bank identifiers like:

```
FLIPKARTAXISBANK
FLIPKARTSBI
BAJAJFINSERV
```

Therefore:

* User input `"AXIS"` matches `"FLIPKARTAXISBANK"`
* Case-insensitive & substring-based matching

---

### **4. Discount rules interpreted from text**

Due to unstructured text, discount extraction uses regexes to identify:

* Flat discounts (`₹500 off`)
* Percent discounts (`10% up to ₹1500`)
* Min order values (`Min Order ₹9999`)
* EMI tenure (`12 months`)

---

### **5. If offer is ambiguous → discount = 0**

Safety fallback to avoid incorrect calculations.

---

# 🏗 **Design Choices**

### **1. Node.js + Express**

* Minimal boilerplate
* Fast JSON handling
* Ideal for lightweight REST microservices

---

### **2. MongoDB + Mongoose**

Chosen because:

* Flipkart data is semi-structured
* Offers vary significantly in structure
* No schema migration overhead
* Nested JSON works naturally

---

### **3. Schema optimized for querying**

Fields are normalized such as:

```
percentage
flatAmount
maxDiscount
minOrderValue
paymentInstruments
providerBanks
```

This allows fast filtering for:

* Bank name
* Payment instrument
* Discount logic

---

### **4. Parsing built via regex**

Text-based offers require heuristic extraction; regex gives:

* High accuracy
* Zero dependencies
* Fast execution
* Easy debugging

---

# ⚡ **Scaling Strategy — 1000 Requests/Second**

To handle **1,000 RPS** for `/highest-discount`, the scaling plan includes:

---

## **1. Add MongoDB Indexes**

```js
db.offers.createIndex({ providerBanks: 1 });
db.offers.createIndex({ paymentInstruments: 1 });
```

Speeds up lookup by >90%.

---

## **2. Introduce Redis Caching**

Cache key:

```
highest:<bank>:<instrument>:<amount>
```

* 10–30 min TTL
* Eliminates repeated DB queries
* Reduces load dramatically for frequently queried banks like SBI, HDFC, AXIS

---

## **3. Horizontal Scaling**

Using PM2 cluster mode:

```
pm2 start server.js -i max
```

Behind:

* NGINX
* AWS ALB
* Cloud Run autopilot

---

## **4. Preloading Offers In-Memory**

Distributed cache (Redis) + warmup on boot:

* Load all offers once
* Filter in-memory
* DB is bypassed entirely during peak load

---

## **5. Lean Mongo Queries**

Always `.lean()`:

```js
Offer.find(query).lean()
```

Removes Mongoose overhead → 20–30% faster.

---

# 🚀 **Future Improvements**

If more time were available, I would implement:

---

### **1. Improve NLP-based Parsing**

Handle complex text like:

* “Valid only on Weekends”
* “Once per user”
* “Only on select product categories”

---

### **2. Full TypeScript Migration**

Benefits:

* Predictable types
* Fewer parsing bugs
* Cleaner interfaces

---

### **3. Admin Dashboard**

A small UI to:

* View parsed offers
* Edit incorrect values
* Trigger re-parsing

---

### **4. Background Scheduler**

Auto-refresh Flipkart offers via cron:

* Hourly updates
* Deduping logic
* Auto-clean older offers

---

### **5. Advanced caching & observability**

* Redis cluster
* Prometheus metrics
* Grafana dashboards
* Distributed tracing (OpenTelemetry)

---

# 📘 **Disclaimer**

> **This project uses Flipkart’s offer API *strictly for evaluation/assignment purposes*.**
> It is NOT affiliated with, supported by, or endorsed by Flipkart in any way.


