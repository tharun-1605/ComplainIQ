#Deployment Link 

https://public-complient-websitw.vercel.app/

# Interactive Map & GridFS Application

> A full-stack web application featuring interactive Mapbox routing and robust large-file storage using MongoDB GridFS.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Workflow](#project-workflow)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [License](#license)

## ✨ Features

- **Interactive Mapping**: Fully interactive maps powered by Mapbox GL JS.
- **Turn-by-Turn Routing**: Integrated directions and route calculations using Mapbox Directions API.
- **Dynamic UI components**: Conditionally styled React components for a seamless user experience.
- **Large File Handling**: Securely upload, store, and stream large files (e.g., images, geo-data) using MongoDB GridFS.

## 💻 Tech Stack

- **Frontend**: React, `clsx` (for dynamic class name construction)
- **Mapping**: `mapbox-gl`, `@mapbox/mapbox-gl-directions`
- **Backend**: Node.js
- **Database**: MongoDB, `mongoose`, `gridfs-stream`

## 🔄 Project Workflow

1. **Map Interaction**: The user loads the application and interacts with the Mapbox canvas. They can set origin and destination points using the Mapbox Directions plugin.
2. **UI State Management**: React manages the state of the map and UI controls, using `clsx` to seamlessly toggle CSS classes based on user interactions (like selecting a route).
3. **Data Retrieval/Storage**: 
   - Standard application data is handled via Mongoose models.
   - When the application needs to handle large assets (such as high-res location images, document uploads, or heavy geographic datasets), the backend uses `gridfs-stream` to chunk and stream these files efficiently into MongoDB without memory bloat.

## 🚀 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

## 🔐 Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file:

`REACT_APP_MAPBOX_ACCESS_TOKEN` - Your public Mapbox API key for rendering the map and calculating directions.

`MONGODB_URI` - Your MongoDB connection string (used by Mongoose and GridFS).

## 💡 Usage

### Mapbox Initialization Example
```javascript
import mapboxgl from 'mapbox-gl';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const map = new mapboxgl.Map({
  container: 'map-container',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-79.4512, 43.6568],
  zoom: 13
});

map.addControl(
  new MapboxDirections({
    accessToken: mapboxgl.accessToken
  }),
  'top-left'
);
```
