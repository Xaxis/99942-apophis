# 🌌 99942 Apophis - Interactive Orbital Mechanics Simulator

An advanced 3D orbital mechanics simulator for asteroid 99942 Apophis, featuring real-time N-body gravitational physics, interactive parameter controls, and visualization of the historic 2029 Earth close approach.

## 🚀 Features

- **Advanced Orbital Mechanics**
  - Keplerian orbital element calculations
  - N-body gravitational perturbations from Sun, Earth, Venus, and Mars
  - Multiple integration methods (Euler, Velocity Verlet, Runge-Kutta 4)
  - Accurate conversion between orbital elements and Cartesian state vectors

- **3D Visualization**
  - Real-time Three.js rendering
  - Orbital trail visualization
  - Interactive camera controls (pan, zoom, rotate)
  - Realistic celestial body scaling and coloring

- **Interactive Controls**
  - Adjust all orbital parameters in real-time:
    - Semi-major axis
    - Eccentricity
    - Inclination
    - Longitude of ascending node
    - Argument of periapsis
    - Mean anomaly
  - Simulation settings:
    - Time scale (speed up/slow down)
    - Integration method selection
    - N-body perturbations toggle
  - Real-time distance and velocity tracking

- **2029 Close Approach Scenario**
  - Pre-configured simulation of Apophis's historic April 13, 2029 flyby
  - Distance tracking: Apophis will pass within ~38,000 km of Earth
  - Closer than geostationary satellites!

## 📊 Orbital Parameters (Apophis)

- **Semi-major Axis**: 0.9224 AU (137.99 million km)
- **Eccentricity**: 0.1911
- **Inclination**: 3.341°
- **Orbital Period**: 323.6 days
- **Size**: 450m × 170m
- **2029 Close Approach**: April 13, 2029 at 21:46 UTC

## 🛠️ Technology Stack

- **TypeScript** - Type-safe development
- **Three.js** - 3D graphics and visualization
- **Vite** - Fast build tool and dev server
- **Advanced Physics**:
  - Kepler's equation solver (Newton-Raphson)
  - RK4 numerical integration
  - N-body gravitational calculations

## 🏃 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment to GitHub Pages

```bash
# Build and deploy
npm run deploy
```

## 🎮 Usage

1. **View the Simulation**: The simulator starts with Apophis's 2029 approach scenario
2. **Adjust Orbital Parameters**: Use the left panel to modify orbital elements in real-time
3. **Control Simulation**:
   - Play/Pause the simulation
   - Adjust time scale for faster/slower motion
   - Toggle N-body perturbations
   - Change integration method for accuracy vs. performance
4. **Navigate**: Use mouse to rotate, zoom, and pan the 3D view
5. **Monitor**: Watch real-time distance and velocity data in the right panel

## 📐 Physics Implementation

### Orbital Mechanics
- Converts Keplerian orbital elements to Cartesian coordinates
- Solves Kepler's equation using Newton-Raphson iteration
- Applies rotation matrices for coordinate transformations

### N-Body Simulation
- Calculates gravitational forces from multiple bodies
- Supports three integration methods:
  - **Euler**: Fast but less accurate
  - **Velocity Verlet**: Good balance of speed and accuracy
  - **RK4**: Most accurate, computationally intensive

### Gravitational Perturbations
- Includes effects from Sun, Earth, Venus, and Mars
- Demonstrates how planetary gravity affects asteroid trajectories
- Shows why precise orbit prediction requires N-body calculations

## 🌍 About Apophis

99942 Apophis is a near-Earth asteroid that briefly held the highest rating on the Torino impact hazard scale. While impact risk has been ruled out for the foreseeable future, its 2029 close approach will be a historic event:

- Closest approach to Earth in recorded history for an asteroid this size
- Will pass within the orbit of geostationary satellites
- Visible to the naked eye from some locations
- Provides unique opportunity for scientific study

## 📚 References

- [NASA JPL Small-Body Database](https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=99942)
- [Wikipedia: 99942 Apophis](https://en.wikipedia.org/wiki/99942_Apophis)
- Orbital mechanics based on standard Keplerian formulations
- Integration methods from numerical analysis literature

## 📄 License

MIT License - feel free to use and modify for educational purposes.

## 🤝 Contributing

Contributions welcome! This simulator can be extended with:
- Additional celestial bodies
- More accurate perturbation models (Yarkovsky effect, etc.)
- Historical trajectory data
- Impact probability visualizations
- And more!

---

**Note**: This is a simplified simulation for educational purposes. For precise orbital predictions, consult NASA JPL Horizons or similar professional tools.