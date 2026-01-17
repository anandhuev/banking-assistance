
---

# 🏦 Smart Bank Visit Planner

*A privacy-first, AI-assisted web app to make physical bank visits predictable and stress-free.*

---

## 📌 Problem Statement

In India, many essential banking services still require **physical branch visits**—such as account opening, KYC corrections, loan processing, and grievance resolution.

However, customers face several challenges:

* No visibility into **crowd levels**
* No idea of **waiting time**
* Uncertainty about **required documents**
* Repeated visits due to poor preparation
* Sudden peak-hour congestion at branches

Existing bank apps focus on digital transactions but **do not optimize physical visits**.

---

## 💡 Solution

**Smart Bank Visit Planner** helps customers plan unavoidable bank visits efficiently by providing:

* Appointment-based visit scheduling
* Crowd-aware time slot recommendations
* Estimated waiting time based on workload
* Document readiness guidance
* Live visit status tracking (without surveillance)

The app focuses on **making physical bank visits intentional, predictable, and respectful of time**.

---

## 🎯 Key Features

### 🔹 1. Appointment Scheduling

* Schedule bank visits within official working hours (10 AM – 5 PM)
* Intelligent slot grouping:

  * Morning Preferred
  * Afternoon Preferred
  * Evening Preferred
* Lunch break (1 PM – 2 PM) clearly marked and blocked

---

### 🔹 2. Crowd Level Estimation

Crowd density is derived from:

* Number of appointments booked for a slot

Crowd levels:

* 🟢 Low
* 🟠 Medium
* 🔴 High

Slots update dynamically as appointments increase.

---

### 🔹 3. AI-Recommended Visit Time

* Prefers **low crowd** slots
* Avoids high crowd slots whenever possible
* Transparent, rule-based logic

---

### 🔹 4. Document Readiness Assistance

For each service:

* Required documents listed
* User selects:

  * **Available**
  * **Not Available**
* If not available, AI explains:

  * Why the document is required
  * Common mistakes
  * How it’s generally obtained
  * Typical time required

(No external redirects, no data collection)

---

### 🔹 5. Live Visit Status Tracking

Status flow:

* **Scheduled**
* **Arrived** (user-confirmed)
* **In Progress** (system-derived)
* **Completed**

🔒 *No GPS, no cameras, no tracking.*

---

### 🔹 6. Estimated Waiting Time

Waiting time is estimated using:

* Number of appointments before the user
* Average service duration per request type

Displayed as:

> ⏳ Estimated Waiting Time: ~XX minutes

This is approximate, transparent, and explainable.

---

### 🔹 7. Floating Live Status Widget

* Collapsible widget on dashboard
* Shows partial live status
* Expandable to full live status page
* Cancel / Reschedule supported

---

### 🔹 8. Appointments History Page

Shows **only real user appointments**:

* Active appointments
* Upcoming appointments
* Cancelled appointments
* Completed appointments

❌ No dummy or fabricated data

---

## 🔐 Privacy & Ethics

This project is **privacy-first by design**:

* No GPS tracking
* No camera access
* No financial data
* No personal identity details
* Arrival is explicitly user-confirmed

> *We don’t track users — we help them plan.*

---

## 🛠 Tech Stack

* **Frontend:** HTML, CSS, Vanilla JavaScript
* **Backend:** None (Prototype / Demo)
* **AI Logic:** Rule-based intelligence
* **Storage:** In-memory (session-based)

---

## 📈 Scalability & Future Scope

In real-world deployment, the system can integrate with:

* Bank appointment databases
* Branch counter systems
* Historical visit data for ML-based predictions
* QR-based check-in at branches

---

## 🧪 Demo Limitations

* No backend integration
* No real bank data
* Waiting time and crowd levels are simulated
* AI logic is explainable and rule-based

These are intentional to maintain transparency and hackathon feasibility.

---

## 🏆 Hackathon Value Proposition

* Solves a **real, everyday problem**
* Focuses on **physical experience optimization**
* Honest AI usage
* Strong privacy stance
* High real-world adoption potential

---

## 👥 Team

[**Anandhu EV**](https://github.com/anandhuev)

[**Sanjeeb J**](https://github.com/Sanjeeb-J)

[**Muhammed Razi**](https://github.com/mkrazi)

[**Karthik S**](https://github.com/K4rthik14)

---

## 📜 License

This project is created for educational and hackathon purposes.

---