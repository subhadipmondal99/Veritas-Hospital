# 🏥 Veritas Hospital Management System

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)

A premium, full-stack healthcare administration platform developed as a comprehensive B.Tech CSE academic project. This project bridges the gap between patient accessibility and administrative efficiency by featuring a modern public-facing website alongside a highly secure, data-driven internal staff dashboard.

---

## ✨ Key Features

### 🌐 Public Portal
* **Premium UI/UX:** Built with modern Glassmorphism design principles, smooth scroll reveals, and CSS Grid layouts.
* **Interactive Departments:** Animated cards detailing centers of excellence.
* **Dynamic Doctor Roster:** A complete, filterable directory of 50+ super-speciality doctors.

### 🔒 Secure Staff Dashboard
* **Authentication:** Secure employee login portal using Firebase Authentication.
* **Greedy Algorithm Bed Allocation:** A proprietary module designed to optimize hospital bed assignments, minimizing patient wait times during emergencies.
* **Patient Management:** Full CRUD (Create, Read, Update, Delete) operations for admitting, editing, and discharging patients via a live database.
* **Real-Time Analytics:** Live data visualization of bed capacity and operational efficiency using Chart.js.
* **Active Status Tracking:** Real-time tracking of doctors' current statuses (e.g., *Available, In Surgery, On Rounds*).

-----

## 🛠️ Tech Stack

* **Frontend:** HTML5, Custom CSS3 (Flexbox/Grid), Vanilla JavaScript (ES6+)
* **Backend & Database:** Google Firebase (Firestore Database)
* **Data Visualization:** Chart.js
* **Icons & Typography:** FontAwesome 6, Google Fonts (Plus Jakarta Sans)

---

## 📂 Project Structure

```text
📁 veritas-hospital
├── 📄 index.html             # Main Landing Page / Public Site
├── 📄 about.html             # Hospital Vision & Mission
├── 📄 departments.html       # Centers of Excellence
├── 📄 doctors.html           # Public Doctor Directory
├── 📄 login.html             # Secure Staff Login Portal
├── 📄 dashbord.html          # Internal Staff Dashboard
├── 📄 register.html          # New Patient Registration
├── 📄 view-patients.html     # Live Patient Directory
├── 📄 doctor-list.html       # Internal Staff Doctor Roster
├── 📄 style.css              # Master Stylesheet (Premium UI)
├── 📄 script.js              # Public Site Logic & Animations
├── 📄 dash-script.js         # Internal Dashboard Logic & Firebase Integration
└── 📄 lscript.js             # Login Authentication Logic
