# PiePayAssgn
Sure bro — I’ll create a **clean, production-quality README.md** for your project based on everything you’ve built:

* Offer scraping + parsing
* MongoDB storage
* Highest-discount API
* Normalised schema
* RegEx bank matching
* Discount calculation logic

Here is the full **README.md**.
Just copy-paste it into your repository root as `README.md`.

---

# 📦 Flipkart Offer Engine — Backend

A Node.js + Express + MongoDB service that **fetches Flipkart bank/UPI offers**, **parses them into structured fields**, **stores them**, and exposes an API to return the **highest discount** applicable for a user’s payment method.

This project solves the challenge of parsing messy Flipkart text offers like:

```
10% Instant Discount up to ₹1,000 on SBI Credit Cards on orders of ₹4,990 and above
```

and turning them into structured JSON like:

```json
{
  "providerBanks": ["SBI"],
  "paymentInstruments": ["CREDIT"],
  "discountType": "PERCENT",
  "percentage": 10,
  "maxDiscount": 1000,
  "minOrderValue": 4990
}
```

---

# 🚀 Tech Stack

* **Node.js**
* **Express**
* **MongoDB + Mongoose**
* **Cheerio** (for scraping)
* **RegEx-based parsing logic**

---

# ✨ Features

### ✔ Scrapes Flipkart offer banners dynamically

### ✔ Parses offer texts into structured numeric fields

### ✔ Stores offers safely in MongoDB

### ✔ Matches bank names using substring search (`AXIS` → `FLIPKARTAXISBANK`)

### ✔ Calculates the best discount using business rules:

* Supports **FLAT**, **PERCENT**, **CASHBACK**, **UNKNOWN**
* Applies **maxDiscount caps**
* Validates **minOrderValue**
* Normalizes commas (“1,900,000”)

### ✔ Returns guaranteed highest discount

---

# 📁 Project Structure

```
/controllers
    scrape.controller.js
    discount.controller.js
/models
    offer.model.js
/utils
    parseFlipkartOffer.js
routes.js
server.js
README.md
```

---

# 🧩 Offer Schema

Your final schema stores offers in a powerful, calculation-friendly format:

```js
{
  offerText: String,

  providerBanks: [String],         // ["SBI", "ICICI"]
  paymentInstruments: [String],     // ["CREDIT", "DEBIT", "UPI"]

  discountType: String,             // "PERCENT", "FLAT", "CASHBACK", "UNKNOWN"

  percentage: Number,               // if PERCENT
  flatAmount: Number,               // if FLAT or cashback
  maxDiscount: Number,              // cap for percentage offers

  minOrderValue: Number,            // offer eligibility condition
}
```

---

# 🔍 API Endpoints

## 1️⃣ Fetch + Save Offers

```
GET /scrape-offers
```

* Fetches offers from Flipkart homepage
* Parses them
* Saves into MongoDB

---

## 2️⃣ Highest Discount API

```
GET /highest-discount?amountToPay=10000&bankName=AXIS&paymentInstrument=CREDIT
```

### Query Parameters

| Name                | Type   | Required | Description                  |
| ------------------- | ------ | -------- | ---------------------------- |
| `amountToPay`       | number | ✔        | Final order amount           |
| `bankName`          | string | ✔        | Bank name (AXIS, SBI, IDFC…) |
| `paymentInstrument` | string | ✖        | CREDIT / DEBIT / UPI         |

### Example Request

```
GET /highest-discount?amountToPay=10000&bankName=AXIS&paymentInstrument=CREDIT
```

### Example Response

```json
{
  "highestDiscountAmount": 500
}
```

---

# 🧠 How Discount Is Calculated

### If `%` type

```
discount = amountToPay * (percentage / 100)
if (maxDiscount exists) discount = min(discount, maxDiscount)
```

### If `FLAT` or `CASHBACK`

```
discount = flatAmount
```

### If `UNKNOWN`

Use:

1. flatAmount
2. or fallback to `value` if older offers exist

### If `minOrderValue` present

If order is below required value → discount = 0

---

# 🎯 Bank Matching Logic

Flipkart sometimes writes provider names weirdly:

* `FLIPKARTAXISBANK`
* `FlipkartAxis`
* `axis exclusive offer`
* `Get ₹500 Off with Axis`

To solve this, matching uses:

```js
providerBanks: { $elemMatch: { $regex: /AXIS/i } }
```

So **AXIS matches anything containing “axis”**.

---

# 🧪 Example SBI Test Case

Your DB contains:

### Offer 1

10% up to 1000

### Offer 2

10% up to 750

### Query:

```
GET /highest-discount?amountToPay=1900000&bankName=SBI&paymentInstrument=CREDIT
```

### Calculation:

* Offer 1 → min(1,900,000 × 10%, 1000) = **1000**
* Offer 2 → min(1,900,000 × 10%, 750) = **750**

### Final Response:

```json
{ "highestDiscountAmount": 1000 }
```

---

# ▶ Run Locally

### Install dependencies

```bash
npm install
```

### Set environment variables

Create `.env`:

```
MONGO_URI=mongodb+srv://...
PORT=5000
```

### Start server

```bash
npm start
```

---

# 🛠 Development Notes

* All offer text inconsistencies are handled using smart RegEx parsing
* Scraper is idempotent — avoids duplicate saves
* Discount calculation is multi-rule and future-proof
* Supports commas in amounts (`1,900,000` → 1900000)

---

# 🤝 Contribution

You can easily extend:

* More bank matching rules
* Additional discount types
* Coupon logic
* User-specific dynamic offers

---

# 📜 License

MIT License.

---

If you want, I can also generate:

✅ A POSTMAN collection
✅ API documentation in Swagger format
✅ A sample `.env.example`
✅ A diagram of offer parsing flow

Just ask bro.
