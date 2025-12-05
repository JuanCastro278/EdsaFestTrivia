# EDSAFEST Trivia 🎉  
_Interactive trivia app powered by Firebase Studio + Next.js_

This project is a gamified, real-time trivia web app developed using **Next.js 13+**, **TailwindCSS**, and **Firebase** (Authentication, Firestore, Hosting, and Storage).

---

## 🚀 Features

- 🔐 **Login system with DNI & password** for event-based access
- 🧠 **Dynamic trivia engine**: Create, manage, and run question rounds in real-time
- 📊 **Live scoreboard**: Points are tracked per user and session
- 📁 **Image support for questions** via Firebase Storage
- 🧑‍💻 **Admin dashboard** to control question flow and rounds
- 📱 **Mobile-optimized UI** with a gamified aesthetic
- ☁️ **Hosted entirely on Firebase** with fast deploy via CLI or Studio

---

## 🛠️ Tech Stack

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase (Firestore, Auth, Storage, Hosting)](https://firebase.google.com/)

---

## 📂 Project Structure

- `src/app/` → App routing & pages
- `src/components/` → UI components
- `src/context/GameContext.tsx` → Global state for game logic
- `firebase.json` → Firebase hosting config
- `.firebaserc` → Project environment

---

## 🚀 Getting Started Locally

```bash
git clone https://github.com/your-username/edsafest-trivia.git
cd edsafest-trivia
npm install
npm run dev
