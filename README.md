# 🏥 SmartFlow Health – Hospital Queue Management System (QMS)

---

## 📌 Project Overview

**SmartFlow Health** is a full-stack Hospital Queue Management System designed to streamline hospital operations and improve patient experience.

It manages the **complete lifecycle of hospital workflows**, including:

* Hospital onboarding
* Department & staff management
* Appointment booking with time slots
* Real-time queue tracking

<img width="1917" height="901" alt="Screenshot 2026-05-01 182010" src="https://github.com/user-attachments/assets/ae3a67f0-abc1-43e7-9d65-0a8a55ef55d9" />
<img width="1919" height="904" alt="Screenshot 2026-05-01 182001" src="https://github.com/user-attachments/assets/ca7753c2-3dd0-4d60-82b1-01a675defc3c" />

### 🛠️ Tech Stack

* **Backend:** Spring Boot 3 (Java 21)
* **Frontend:** Angular 21 (SPA)
* **Database:** MySQL 8 (`hospital_qms`)
* **Authentication:** JWT (Stateless)

---

## 👥 System Roles & Responsibilities

The system supports **5 user roles**:

### 🔹 SUPER_ADMIN

* Platform owner
* Creates hospitals
* Assigns first admin
* Manages all users and hospitals
<img width="1919" height="916" alt="Screenshot 2026-05-01 182034" src="https://github.com/user-attachments/assets/a964e117-39f0-49e3-8bdb-4b2bb43bc43c" />

### 🔹 ADMIN

* Manages hospital operations
* Creates departments
* Manages staff (max 2 admins per hospital)
* Views registered patients
<img width="1917" height="901" alt="image" src="https://github.com/user-attachments/assets/87900b42-98d4-4554-a481-0818abb0e4ba" />

### 🔹 DOCTOR
* Assigned to departments
* Handles appointments booked by patients

### 🔹 RECEPTIONIST

* Handles daily queue
* Creates walk-in tokens
* Updates token status:

  * `WAITING → IN_PROGRESS → COMPLETED / CANCELLED`
* Marks emergency cases

### 🔹 PATIENT

* Registers and logs in
* Searches hospitals by city
* Books appointments with time slots
* Tracks live queue status
<img width="1915" height="910" alt="Screenshot 2026-05-01 182153" src="https://github.com/user-attachments/assets/87dbc275-d97d-4176-ba9d-f28edb898854" />

---

## 🏗️ System Architecture

SmartFlow follows a **3-tier architecture**:

### 1️⃣ Presentation Layer

* Angular 21 SPA
* Runs on **port 4200**

### 2️⃣ Business Logic Layer

* Spring Boot REST API
* Runs on **port 8081**

### 3️⃣ Data Layer

* MySQL database (`hospital_qms`)

### 🔐 Authentication

* Stateless JWT-based authentication
* Token passed via `Authorization` header

👉 Frontend and backend are **fully decoupled**

---

## 📅 Appointment Booking Flow

1. Patient logs in and searches hospitals by city
2. Selects hospital → views departments
3. Selects department → views doctors
4. Selects doctor → opens booking page
5. Picks a date → calls:

   ```
   GET /appointments/slots?doctorId=X&date=Y
   ```
6. System generates 15-minute slots:

   * 🕘 09:00 – 17:00
   * 🍽️ Lunch break: 12:00 – 13:00
7. Booked slots are filtered out
8. Patient selects available slot
9. Calls:

   ```
   POST /appointments/book
   ```
10. System:

* Saves appointment
* Auto-generates queue token (`WAITING`)

11. Patient can view:

```
GET /appointments/my
```

---

## 🔄 Live Queue System

* Public endpoint:

  ```
  GET /queue/{deptId}/live
  ```
* Returns:

  * All `WAITING` tokens
  * Sorted by:

    * Priority (DESC)
    * Appointment time (ASC)

### 📺 Frontend Behavior

* Polls every **5 seconds**
* Displays queue on **TV / monitor**

### 🧾 Receptionist Actions

* View today’s queue:

  ```
  GET /queue/{deptId}/today
  ```
* Update token status:

  * WAITING → IN_PROGRESS → COMPLETED / CANCELLED

---

## ☕ Java & Backend Highlights

### 🔹 Java Version

* Java **21 (LTS)**

### 🔹 Key Features Used / Applicable

* **Records** → Immutable DTOs (alternative to Lombok)
* **Sealed Classes** → Token status modeling
* **Pattern Matching** → Cleaner exception handling
* **Text Blocks** → SQL / JSON templates
* **Virtual Threads** → Efficient I/O handling
* **Enhanced Switch** → Role-based logic

---

## 🚀 Key Features

* ✅ Multi-role access control (RBAC)
* ✅ JWT-based authentication
* ✅ Real-time queue management
* ✅ Appointment slot generation
* ✅ Walk-in token system
* ✅ Live queue display
* ✅ Scalable architecture

---

## ⚙️ Setup Instructions

### Backend (Spring Boot)

```bash
mvn clean install
mvn spring-boot:run
```

### Frontend (Angular)

```bash
npm install
ng serve
```

### Database

* MySQL 8
* Create schema:

```sql
CREATE DATABASE hospital_qms;
```

---

## 📌 Future Enhancements

* 🔔 Notifications (SMS / Email)
* 📊 Analytics dashboard
* ⚡ WebSocket-based real-time queue (instead of polling)
* 📱 Mobile app support
* 🧠 AI-based queue prediction

---

## 👨‍💻 Author

**Gokulnath Sivakumar**

---

## ⭐ If you like this project

Give it a ⭐ on GitHub!
