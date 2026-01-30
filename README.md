# 99942 Apophis Orbital Simulator

An interactive 3D orbital mechanics simulator for asteroid 99942 Apophis, built with modern web technologies.

🌐 **Live at [apophis.bot](https://apophis.bot)**

## 🚀 Features

- **Interactive 3D Visualization**: Real-time 3D rendering using Three.js and React Three Fiber
- **N-Body Gravitational Simulation**: Accurate orbital mechanics with multiple integration methods (Euler, Verlet, RK4)
- **Adjustable Orbital Parameters**: Modify all six Keplerian orbital elements in real-time
- **Educational Modals**: Comprehensive information about Apophis and orbital mechanics
- **Modern UI**: Built with React, Next.js, TypeScript, and Tailwind CSS
- **GitHub Pages Deployment**: Automatic deployment via GitHub Actions

## 🛠️ Technologies

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Three.js** - 3D graphics
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers for R3F
- **Lucide React** - Icon library

## 📦 Installation

```bash
yarn install
```

## 🏃 Development

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the simulator.

## 🏗️ Build

```bash
yarn build
```

This creates a static export in the `out` directory, ready for deployment to GitHub Pages.

## 🌐 Deployment

The project is configured for automatic deployment to GitHub Pages with a custom domain:

1. Push to the `main` branch
2. GitHub Actions automatically builds and deploys
3. Site is live at **[apophis.bot](https://apophis.bot)**

### Custom Domain Setup

The repository is configured with the custom domain `apophis.bot`:

- CNAME file in `public/` directory
- GitHub Pages configured to use custom domain
- DNS configured with CNAME record pointing to GitHub Pages

## 🎮 Usage

### Controls

- **Play/Pause**: Start or stop the simulation
- **Reset**: Return to initial state with today's date
- **Toggle Labels**: Show/hide body labels
- **About Apophis**: Learn about the asteroid and the 2029 close approach

### Orbital Elements

Adjust Apophis's orbital parameters:

- **Semi-Major Axis**: Size of the orbit (AU)
- **Eccentricity**: How elliptical the orbit is (0-1)
- **Inclination**: Tilt relative to Earth's orbit (degrees)
- **Longitude of Ascending Node**: Where orbit crosses ecliptic plane (degrees)
- **Argument of Periapsis**: Orientation of ellipse (degrees)
- **Mean Anomaly**: Position in orbit (degrees)

### Simulation Settings

- **Time Scale**: Speed multiplier (1-1000x)
- **Time Step**: Calculation interval (60-86400 seconds)
- **Integration Method**: Numerical algorithm (Euler/Verlet/RK4)
- **N-Body Perturbations**: Include gravitational effects from all bodies

## 📚 About Apophis

99942 Apophis is a near-Earth asteroid approximately 370 meters in diameter. On April 13, 2029, it will pass within ~31,000 km of Earth - closer than geostationary satellites. NASA has confirmed there is zero impact risk for at least 100 years.

## 🧮 Physics

The simulator uses:

- Keplerian orbital mechanics for 2-body motion
- N-body gravitational simulation with Newton's law of gravitation
- Multiple integration methods (RK4 recommended for accuracy)
- Coordinate transformations from orbital plane to ecliptic coordinates

## 📄 License

MIT

## 👨‍💻 Author

Built with modern best practices using React, Next.js, and TypeScript.
