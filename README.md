# ⚡ Switch Controller Widget

A custom widget built using **ArcGIS Experience Builder** to simulate and control switch operations in an electric distribution network.

---

## 🚀 Overview

The **Switch Controller Widget** allows users to:

- Open / Close electrical switches  
- Update device status in real-time  
- Simulate feeder behavior  
- Support network analysis workflows  

This widget is designed for **utility network-like applications** such as power distribution systems (e.g., KSEB projects).

---

## 🧠 Key Features

- 🔘 Toggle switch status (OPEN / CLOSED)  
- 📡 Update feature attributes using `applyEdits()`  
- 🧭 Filter by Feeder ID  
- ⚡ Simulate downstream impact (basic logic)  
- 🗺️ Interactive map integration  

---

## 🛠️ Tech Stack

- React + TypeScript  
- ArcGIS Experience Builder  
- ArcGIS JavaScript API  

---

## ⚙️ How It Works

1. User selects a switch from the map  
2. Widget reads feature attributes  
3. User toggles switch status  
4. Widget updates status using:

